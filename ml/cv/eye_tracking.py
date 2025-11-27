import cv2
import numpy as np

# --- Landmark constants for MediaPipe Face Mesh ---
LEFT_EYE = [362, 382, 381, 380, 373, 374, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

# Mouth landmarks (Inner lips)
MOUTH_TOP = 13
MOUTH_BOTTOM = 14
MOUTH_LEFT = 61
MOUTH_RIGHT = 291

EAR_THRESHOLD = 0.2 # Eye Aspect Ratio threshold for blink
MOUTH_OPEN_THRESHOLD = 15.0 # Threshold to detect if talking

def get_head_pose(frame, landmarks):
    """
    Calculates the 3D head pose from 2D facial landmarks.
    Returns: (x, y, z) rotation angles.
    """
    frame_h, frame_w, _ = frame.shape
    focal_length = frame_w
    center = (frame_w / 2, frame_h / 2)
    cam_matrix = np.array([[focal_length, 0, center[0]], [0, focal_length, center[1]], [0, 0, 1]], dtype=np.float64)
    dist_coeffs = np.zeros((4, 1), dtype=np.float64)

    # Standard 3D face model points
    model_points = np.array([
        (0.0, 0.0, 0.0),      # Nose tip
        (0.0, -330.0, -65.0), # Chin
        (-225.0, 170.0, -135.0), # Left eye left corner
        (225.0, 170.0, -135.0),  # Right eye right corner
        (-150.0, -150.0, -125.0), # Left mouth corner
        (150.0, -150.0, -125.0),  # Right mouth corner
    ])

    # 2D image points from MediaPipe
    image_points = np.array([
        (landmarks[1].x * frame_w, landmarks[1].y * frame_h),
        (landmarks[152].x * frame_w, landmarks[152].y * frame_h),
        (landmarks[33].x * frame_w, landmarks[33].y * frame_h),
        (landmarks[263].x * frame_w, landmarks[263].y * frame_h),
        (landmarks[61].x * frame_w, landmarks[61].y * frame_h),
        (landmarks[291].x * frame_w, landmarks[291].y * frame_h),
    ], dtype=np.float64)

    try:
        _, rot_vec, _ = cv2.solvePnP(model_points, image_points, cam_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)
        rot_mat, _ = cv2.Rodrigues(rot_vec)
        sy = np.sqrt(rot_mat[0, 0] * rot_mat[0, 0] + rot_mat[1, 0] * rot_mat[1, 0])
        singular = sy < 1e-6
        if not singular:
            x = np.arctan2(rot_mat[2, 1], rot_mat[2, 2])
            y = np.arctan2(-rot_mat[2, 0], sy)
            z = np.arctan2(rot_mat[1, 0], rot_mat[0, 0])
        else:
            x = np.arctan2(-rot_mat[1, 2], rot_mat[1, 1])
            y = np.arctan2(-rot_mat[2, 0], sy)
            z = 0
        return np.degrees([x, y, z])
    except:
        return 0, 0, 0

def is_looking_at_camera(x_angle, y_angle, threshold=15):
    return abs(y_angle) < threshold and abs(x_angle) < (threshold + 5)

# --- IMPROVED BLINK LOGIC (With Talking Suppression) ---

def get_eye_aspect_ratio(eye_landmarks, landmarks, w, h):
    """Calculates EAR for one eye."""
    # Convert normalized landmarks to pixel coordinates
    coords = np.array([(landmarks[i].x * w, landmarks[i].y * h) for i in eye_landmarks])
    
    # Vertical distances
    A = np.linalg.norm(coords[1] - coords[14]) # Top-Bottom outer
    B = np.linalg.norm(coords[2] - coords[13]) # Top-Bottom inner
    # Horizontal distance
    C = np.linalg.norm(coords[0] - coords[8])  # Left-Right
    
    return (A + B) / (2.0 * C)

def get_mouth_openness(landmarks, w, h):
    """Calculates how open the mouth is to detect talking."""
    top = np.array([landmarks[MOUTH_TOP].x * w, landmarks[MOUTH_TOP].y * h])
    bottom = np.array([landmarks[MOUTH_BOTTOM].x * w, landmarks[MOUTH_BOTTOM].y * h])
    left = np.array([landmarks[MOUTH_LEFT].x * w, landmarks[MOUTH_LEFT].y * h])
    right = np.array([landmarks[MOUTH_RIGHT].x * w, landmarks[MOUTH_RIGHT].y * h])

    vert = np.linalg.norm(top - bottom)
    hor = np.linalg.norm(left - right)
    
    if hor == 0: return 0
    return (vert / hor) * 100.0

def is_blinking(landmarks, frame_shape):
    """
    Checks for blinks, BUT returns False if the user is talking.
    """
    h, w, _ = frame_shape
    try:
        # 1. Check if Talking (Mouth is moving/open)
        mouth_open_score = get_mouth_openness(landmarks, w, h)
        
        # If mouth is open significantly, assume talking -> Don't count blinks
        if mouth_open_score > MOUTH_OPEN_THRESHOLD:
            return False

        # 2. If NOT talking, check for blinks
        left_ear = get_eye_aspect_ratio(LEFT_EYE, landmarks, w, h)
        right_ear = get_eye_aspect_ratio(RIGHT_EYE, landmarks, w, h)
        avg_ear = (left_ear + right_ear) / 2.0
        
        return avg_ear < EAR_THRESHOLD
        
    except Exception:
        return False