"""Static seed content: DSA problems by pattern, system design videos, mocks."""
LC = "https://leetcode.com/problems/"

PATTERNS = [
    ("Hashing", [
        ("217", "Contains Duplicate", "Easy", "contains-duplicate"),
        ("242", "Valid Anagram", "Easy", "valid-anagram"),
        ("1", "Two Sum", "Easy", "two-sum"),
        ("49", "Group Anagrams", "Medium", "group-anagrams"),
        ("36", "Valid Sudoku", "Medium", "valid-sudoku"),
        ("347", "Top K Frequent Elements", "Medium", "top-k-frequent-elements"),
        ("128", "Longest Consecutive Sequence", "Medium", "longest-consecutive-sequence"),
    ]),
    ("Two Pointers", [
        ("125", "Valid Palindrome", "Easy", "valid-palindrome"),
        ("167", "Two Sum II", "Medium", "two-sum-ii-input-array-is-sorted"),
        ("11", "Container With Most Water", "Medium", "container-with-most-water"),
        ("15", "3Sum", "Medium", "3sum"),
    ]),
    ("Sliding Window", [
        ("121", "Best Time to Buy and Sell Stock", "Easy", "best-time-to-buy-and-sell-stock"),
        ("3", "Longest Substring Without Repeating Characters", "Medium", "longest-substring-without-repeating-characters"),
        ("424", "Longest Repeating Character Replacement", "Medium", "longest-repeating-character-replacement"),
    ]),
    ("Stack", [
        ("20", "Valid Parentheses", "Easy", "valid-parentheses"),
        ("155", "Min Stack", "Medium", "min-stack"),
        ("739", "Daily Temperatures", "Medium", "daily-temperatures"),
    ]),
    ("Binary Search", [
        ("704", "Binary Search", "Easy", "binary-search"),
        ("153", "Find Minimum in Rotated Sorted Array", "Medium", "find-minimum-in-rotated-sorted-array"),
        ("33", "Search in Rotated Sorted Array", "Medium", "search-in-rotated-sorted-array"),
    ]),
    ("Linked Lists", [
        ("206", "Reverse Linked List", "Easy", "reverse-linked-list"),
        ("21", "Merge Two Sorted Lists", "Easy", "merge-two-sorted-lists"),
        ("141", "Linked List Cycle", "Easy", "linked-list-cycle"),
        ("19", "Remove Nth Node From End of List", "Medium", "remove-nth-node-from-end-of-list"),
        ("143", "Reorder List", "Medium", "reorder-list"),
        ("146", "LRU Cache", "Medium", "lru-cache"),
    ]),
    ("Trees", [
        ("226", "Invert Binary Tree", "Easy", "invert-binary-tree"),
        ("100", "Same Tree", "Easy", "same-tree"),
        ("104", "Maximum Depth of Binary Tree", "Easy", "maximum-depth-of-binary-tree"),
        ("235", "Lowest Common Ancestor of a BST", "Medium", "lowest-common-ancestor-of-a-binary-search-tree"),
        ("102", "Binary Tree Level Order Traversal", "Medium", "binary-tree-level-order-traversal"),
        ("199", "Binary Tree Right Side View", "Medium", "binary-tree-right-side-view"),
        ("110", "Balanced Binary Tree", "Easy", "balanced-binary-tree"),
        ("543", "Diameter of Binary Tree", "Easy", "diameter-of-binary-tree"),
        ("572", "Subtree of Another Tree", "Easy", "subtree-of-another-tree"),
        ("1448", "Count Good Nodes in Binary Tree", "Medium", "count-good-nodes-in-binary-tree"),
        ("98", "Validate Binary Search Tree", "Medium", "validate-binary-search-tree"),
        ("230", "Kth Smallest Element in a BST", "Medium", "kth-smallest-element-in-a-bst"),
    ]),
    ("Heaps / Priority Queue", [
        ("1046", "Last Stone Weight", "Easy", "last-stone-weight"),
        ("703", "Kth Largest Element in a Stream", "Easy", "kth-largest-element-in-a-stream"),
        ("215", "Kth Largest Element in an Array", "Medium", "kth-largest-element-in-an-array"),
    ]),
    ("Graphs", [
        ("200", "Number of Islands", "Medium", "number-of-islands"),
        ("695", "Max Area of Island", "Medium", "max-area-of-island"),
        ("133", "Clone Graph", "Medium", "clone-graph"),
        ("130", "Surrounded Regions", "Medium", "surrounded-regions"),
        ("417", "Pacific Atlantic Water Flow", "Medium", "pacific-atlantic-water-flow"),
        ("207", "Course Schedule", "Medium", "course-schedule"),
        ("210", "Course Schedule II", "Medium", "course-schedule-ii"),
    ]),
    ("Prefix / Suffix", [
        ("238", "Product of Array Except Self", "Medium", "product-of-array-except-self"),
    ]),
]

SD_PLAYLIST_ID = "PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX"
# (title, youtube video id) in playlist order
SD_VIDEOS = [
    ("System Design Primer: How to start with distributed systems?", "SqcXvc3ZmRU"),
    ("System Design BASICS: Horizontal vs. Vertical Scaling", "xpDnVSmNFX0"),
    ("What is LOAD BALANCING?", "K0Ta65OqQkY"),
    ("What is CONSISTENT HASHING and Where is it used?", "zaRkONvyGr8"),
    ("What is a MESSAGE QUEUE and Where is it used?", "oUJbuFMyBDk"),
    ("What is a MICROSERVICE ARCHITECTURE and what are its advantages?", "qYhRvH9tJKw"),
    ("What is DATABASE SHARDING?", "5faMjKuB9bc"),
    ("Caching in distributed systems: A friendly introduction", "zw7VwIlkPPc"),
    ("How to avoid a single point of failure in distributed systems", "-BOysyYErLY"),
    ("What is a CDN (Content Delivery Network)?", "b4_6thkYZXs"),
    ("What is the Publisher Subscriber Model?", "FMhbR_kQeHw"),
    ("What's an Event Driven System?", "rJHTK2TfZ1I"),
    ("Introduction to NoSQL databases", "xQnIN9bW0og"),
    ("What is an API and how do you design it?", "_YlYuNMTCc8"),
    ("System Design: TINDER as a microservice architecture", "tndzLznxq40"),
    ("Designing INSTAGRAM: System Design of News Feed", "QmX2NPkJTKg"),
    ("WHATSAPP System Design: Chat Messaging Systems for Interviews", "vvhC64hQZMk"),
    ("How NETFLIX onboards new content: Video Processing at scale", "x9Hrn0oNmJM"),
    ("Capacity Planning and Estimation: How much data does YouTube store daily?", "0myM0k1mjZw"),
    ("How databases scale writes: The power of the log", "_5vrfuwhvlQ"),
    ("Distributed Consensus and Data Replication strategies on the server", "GeGxgmPTe4c"),
    ("Designing a location database: QuadTrees and Hilbert Curves", "OcUKFIjhKu0"),
    ("Data Consistency and Tradeoffs in Distributed Systems", "m4q7VkgDWrM"),
    ("System Design Interview: TikTok architecture with @sudocode", "07BVxmVFDGY"),
    ("5 Tips for System Design Interviews", "CtmBGH8MkX4"),
    ("System Design Walkthrough at InterviewReady (SDE 1 to SDE 3)", "CC-AxHIgBSM"),
]

MOCK_PLAYLIST_ID = "PL5q3E8eRUieWtYLmRU3z94-vGRcwKr9tM"
# System design mock interview videos: (title, youtube video id), in playlist order.
# Skipped the playlist's duplicate "(old)" Ad Click Aggregator video (1oFVUT4_Yy0).
MOCK_VIDEOS = [
    ("Design Ticketmaster", "fhdPyoO6aXI"),
    ("Design Uber", "lsKU38RKQSo"),
    ("Design Dropbox / Google Drive", "_UZ1ngy-kOI"),
    ("Design Bitly (URL shortener)", "iUU4O1sWtJA"),
    ("Design WhatsApp", "cr6p0n0N-VA"),
    ("Design Twitter", "Nfa-uUHuFHg"),
    ("Design a Distributed Rate Limiter", "MIJFyUPG4Z4"),
    ("Design an Ad Click Aggregator", "Zcv_899yqhI"),
    ("Design YouTube", "IUrQ5_g3XKs"),
    ("Design a Web Crawler", "krsuaUp__pM"),
    ("Design LeetCode (Online Judge)", "1xHADtekTNg"),
    ("Design Tinder", "18Fg5Akhkqw"),
    ("Design Live Comments", "LjLx0fCd1k8"),
    ("Design FB News Feed", "Qj4-GruzyDU"),
    ("Design Top-K", "y-tA2NW4LNY"),
    ("Design FB Post Search", "l38XL9914fs"),
]

MOCKS_SEED = [
    ("Pramp DSA Mock #1", "DSA", "Pramp", "https://www.pramp.com/"),
    ("Pramp DSA Mock #2", "DSA", "Pramp", "https://www.pramp.com/"),
    ("Pramp System Design Mock", "System Design", "Pramp", "https://www.pramp.com/"),
]

LLD_PLAYLIST_ID = "PLliXPok7Zonm0trweRA2UeSTTLVYiPzNG"
# (title, youtube video id) in playlist order
LLD_VIDEOS = [
    ("Basics of LLD | UML Diagram in detail | Association Vs Aggregation Vs Composition | VERY imp!!", "j84w5VM9GT8"),
    ("LLD RoadMap | What to study for Low Level System Design Interviews | Object Oriented Design Round 🫣", "9_7jDlmexME"),
    ("Uber/Ola Low Level System Design explained with CODE, UML Diagram | Easy & Detailed Explanation!!", "a-F45Jov0Ck"),
    ("Swiggy/Zomato Low Level System Design | Whiteboard explanation, UML, Code in Detail", "XN17WWiUzT4"),
    ("Machine Coding Interview Round | Design and Code Zerodha like Stock Broker App LIVE-Low Level Design", "OVkxdFJLgwE"),
    ("Quadtrees Explained with Code in Easiest Way | Machine Coding | Used in Spatial Databases!", "kClPBNmTCf0"),
    ("10 LLD Interview Tips you should follow!!", "paNwoBzpYto"),
    ("Launching 5-Week LIVE LLD Course | Low Level Design | Beginner Friendly", "YtXegGXs0Y0"),
]
