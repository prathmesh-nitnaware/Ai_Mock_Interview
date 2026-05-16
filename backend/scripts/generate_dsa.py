import json

difficulties = ["Easy"] * 20 + ["Medium"] * 20 + ["Hard"] * 10

topics = ["Array", "String", "Linked List", "Tree", "Graph", "DP", "Math"]
templates = {
    "Easy": [
        ("Two Sum", "Find two numbers that add up to a target.", "def twoSum(nums, target):\n    pass"),
        ("Reverse String", "Reverse the given string.", "def reverseString(s):\n    pass"),
        ("Palindrome Check", "Check if string is a palindrome.", "def isPalindrome(s):\n    pass"),
        ("Valid Anagram", "Check if two strings are anagrams.", "def isAnagram(s, t):\n    pass"),
        ("Contains Duplicate", "Check if array has duplicates.", "def containsDuplicate(nums):\n    pass"),
        ("Max Subarray", "Find the contiguous subarray with the largest sum.", "def maxSubArray(nums):\n    pass"),
        ("Merge Sorted Array", "Merge two sorted arrays.", "def merge(nums1, m, nums2, n):\n    pass"),
        ("Climbing Stairs", "Find distinct ways to climb n stairs.", "def climbStairs(n):\n    pass"),
        ("Missing Number", "Find the missing number in an array.", "def missingNumber(nums):\n    pass"),
        ("Binary Search", "Implement binary search.", "def search(nums, target):\n    pass")
    ],
    "Medium": [
        ("3Sum", "Find all unique triplets that sum to zero.", "def threeSum(nums):\n    pass"),
        ("Longest Substring Without Repeating", "Find longest substring without repeating characters.", "def lengthOfLongestSubstring(s):\n    pass"),
        ("Container With Most Water", "Find two lines that form a container holding the most water.", "def maxArea(height):\n    pass"),
        ("Valid Sudoku", "Determine if a 9x9 Sudoku board is valid.", "def isValidSudoku(board):\n    pass"),
        ("Word Search", "Check if word exists in a grid.", "def exist(board, word):\n    pass"),
        ("Course Schedule", "Determine if all courses can be finished.", "def canFinish(numCourses, prerequisites):\n    pass"),
        ("Coin Change", "Find minimum coins to make up an amount.", "def coinChange(coins, amount):\n    pass"),
        ("Longest Increasing Subsequence", "Find length of longest strictly increasing subsequence.", "def lengthOfLIS(nums):\n    pass"),
        ("Next Permutation", "Find the next lexicographical permutation.", "def nextPermutation(nums):\n    pass"),
        ("Rotting Oranges", "Find min time for all oranges to rot.", "def orangesRotting(grid):\n    pass")
    ],
    "Hard": [
        ("Median of Two Sorted Arrays", "Find the median of two sorted arrays.", "def findMedianSortedArrays(nums1, nums2):\n    pass"),
        ("Merge k Sorted Lists", "Merge k sorted linked lists.", "def mergeKLists(lists):\n    pass"),
        ("Trapping Rain Water", "Compute how much water can be trapped after raining.", "def trap(height):\n    pass"),
        ("N-Queens", "Solve the N-Queens problem.", "def solveNQueens(n):\n    pass"),
        ("Word Ladder", "Find length of shortest transformation sequence.", "def ladderLength(beginWord, endWord, wordList):\n    pass"),
        ("Regular Expression Matching", "Implement regex matching with support for '.' and '*'.", "def isMatch(s, p):\n    pass"),
        ("Longest Valid Parentheses", "Find length of longest valid parentheses substring.", "def longestValidParentheses(s):\n    pass"),
        ("Edit Distance", "Find the minimum edit distance between two strings.", "def minDistance(word1, word2):\n    pass"),
        ("Sliding Window Maximum", "Find the maximum in each sliding window.", "def maxSlidingWindow(nums, k):\n    pass"),
        ("Alien Dictionary", "Find the correct order of characters in an alien language.", "def alienOrder(words):\n    pass")
    ]
}

challenges = []
counter = 1

for diff in ["Easy", "Medium", "Hard"]:
    pool = templates[diff]
    count = 20 if diff != "Hard" else 10
    for i in range(count):
        # reuse templates if count > len(pool) by appending index
        base = pool[i % len(pool)]
        title = base[0] if i < len(pool) else f"{base[0]} Variant {i}"
        
        challenges.append({
            "id": f"dsa_{counter}",
            "title": title,
            "difficulty": diff,
            "description": base[1],
            "constraints": ["Optimal time complexity expected.", "Standard memory limits apply."],
            "starter_code": base[2],
            "sample_input": "...",
            "sample_output": "..."
        })
        counter += 1

with open('routes/coding_data.py', 'w') as f:

    f.write('CHALLENGES = ')
    f.write(json.dumps(challenges, indent=4))
