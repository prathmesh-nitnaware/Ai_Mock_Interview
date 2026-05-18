import re
import os

samples = {
    "Two Sum": {"in": "nums = [2,7,11,15], target = 9", "out": "[0,1]"},
    "Reverse String": {"in": 's = ["h","e","l","l","o"]', "out": '["o","l","l","e","h"]'},
    "Palindrome Check": {"in": 's = "A man, a plan, a canal: Panama"', "out": 'true'},
    "Valid Anagram": {"in": 's = "anagram", t = "nagaram"', "out": 'true'},
    "Contains Duplicate": {"in": "nums = [1,2,3,1]", "out": "true"},
    "Max Subarray": {"in": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "out": "6"},
    "Merge Sorted Array": {"in": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", "out": "[1,2,2,3,5,6]"},
    "Climbing Stairs": {"in": "n = 2", "out": "2"},
    "Missing Number": {"in": "nums = [3,0,1]", "out": "2"},
    "Binary Search": {"in": "nums = [-1,0,3,5,9,12], target = 9", "out": "4"},
    "3Sum": {"in": "nums = [-1,0,1,2,-1,-4]", "out": "[[-1,-1,2],[-1,0,1]]"},
    "Longest Substring Without Repeating": {"in": 's = "abcabcbb"', "out": "3"},
    "Container With Most Water": {"in": "height = [1,8,6,2,5,4,8,3,7]", "out": "49"},
    "Valid Sudoku": {"in": 'board = [["5","3","."], ...]', "out": "true"},
    "Word Search": {"in": 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', "out": "true"},
    "Course Schedule": {"in": "numCourses = 2, prerequisites = [[1,0]]", "out": "true"},
    "Coin Change": {"in": "coins = [1,2,5], amount = 11", "out": "3"},
    "Longest Increasing Subsequence": {"in": "nums = [10,9,2,5,3,7,101,18]", "out": "4"},
    "Next Permutation": {"in": "nums = [1,2,3]", "out": "[1,3,2]"},
    "Rotting Oranges": {"in": "grid = [[2,1,1],[1,1,0],[0,1,1]]", "out": "4"},
    "Median of Two Sorted Arrays": {"in": "nums1 = [1,3], nums2 = [2]", "out": "2.0"},
    "Merge k Sorted Lists": {"in": "lists = [[1,4,5],[1,3,4],[2,6]]", "out": "[1,1,2,3,4,4,5,6]"},
    "Trapping Rain Water": {"in": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "out": "6"},
    "N-Queens": {"in": "n = 4", "out": '[[ ".Q..", "...Q", "Q...", "..Q." ], ... ]'},
    "Word Ladder": {"in": 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', "out": "5"},
    "Regular Expression Matching": {"in": 's = "aa", p = "a*"', "out": "true"},
    "Longest Valid Parentheses": {"in": 's = ")()())"', "out": "4"},
    "Edit Distance": {"in": 'word1 = "horse", word2 = "ros"', "out": "3"},
    "Sliding Window Maximum": {"in": "nums = [1,3,-1,-3,5,3,6,7], k = 3", "out": "[3,3,5,5,6,7]"},
    "Alien Dictionary": {"in": 'words = ["wrt","wrf","er","ett","rftt"]', "out": '"wertf"'}
}

file_path = r"d:\Prep_AI\backend\routes\coding_data.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# For each base title, replace the corresponding "..." in sample_input and sample_output
# We can do this by executing the file to get the CHALLENGES list, then writing it back.

import sys
sys.path.append(os.path.dirname(file_path))
from coding_data import CHALLENGES

for challenge in CHALLENGES:
    for key, val in samples.items():
        if challenge["title"].startswith(key):
            challenge["sample_input"] = val["in"]
            challenge["sample_output"] = val["out"]
            break

# Now write back the list
out_lines = ["CHALLENGES = ["]
for i, c in enumerate(CHALLENGES):
    out_lines.append("    {")
    out_lines.append(f'        "id": "{c["id"]}",')
    out_lines.append(f'        "title": "{c["title"]}",')
    out_lines.append(f'        "difficulty": "{c["difficulty"]}",')
    out_lines.append(f'        "description": "{c["description"]}",')
    out_lines.append(f'        "constraints": [')
    for const in c["constraints"]:
        out_lines.append(f'            "{const}",')
    # strip trailing comma from last constraint
    out_lines[-1] = out_lines[-1].rstrip(',')
    out_lines.append(f'        ],')
    # escape newlines and quotes in starter code
    sc = c["starter_code"].replace('\n', '\\n').replace('"', '\\"')
    out_lines.append(f'        "starter_code": "{sc}",')
    
    si = c["sample_input"].replace('\n', '\\n').replace('"', '\\"')
    out_lines.append(f'        "sample_input": "{si}",')
    
    so = c["sample_output"].replace('\n', '\\n').replace('"', '\\"')
    out_lines.append(f'        "sample_output": "{so}"')
    
    if i == len(CHALLENGES) - 1:
        out_lines.append("    }")
    else:
        out_lines.append("    },")
out_lines.append("]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines) + "\n")

print("Successfully updated sample inputs and outputs.")
