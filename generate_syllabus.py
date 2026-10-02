import json

syllabus = {
    "BCSOS303": {
        "title": "Operating System",
        "code": "BCSOS303",
        "sem": "3rd Semester",
        "scheme": "Autonomous Scheme 2024 / VTU",
        "modules": [
            {
                "id": "os_m1",
                "name": "Module 1: Introduction to Operating Systems",
                "hours": "08 Hours",
                "topics": [
                    "What Operating Systems do",
                    "Computer System organization & architecture",
                    "Operating System structure & operations",
                    "Operating System services",
                    "System Calls & System Programs",
                    "Operating System design and implementation",
                    "Simple, Layered, Microkernels and Modules"
                ],
                "recommendedFiles": [
                    "OS Module 1 notes.pdf",
                    "OS-Module-1.pdf",
                    "os-module1.pdf",
                    "OPERATING SYSTEM PART-1 (1).pdf",
                    "Final Question Bank-BCSOS303.pdf"
                ]
            },
            {
                "id": "os_m2",
                "name": "Module 2: Process Management & CPU Scheduling",
                "hours": "08 Hours",
                "topics": [
                    "Process concept & Process Control Block (PCB)",
                    "Process scheduling & Queues",
                    "Operations on processes (fork, exec, wait, exit)",
                    "Inter-process communication (Shared Memory & Message Passing)",
                    "Overview of Threads & Multithreaded models",
                    "Basic concepts of scheduling & Scheduling criteria",
                    "Scheduling algorithms: FCFS, SJF, Priority, Round Robin, Multilevel Queue"
                ],
                "recommendedFiles": [
                    "OPERATING SYSTEM PART-1 (1).pdf",
                    "Final Question Bank-BCSOS303.pdf"
                ]
            },
            {
                "id": "os_m3",
                "name": "Module 3: Process Synchronization",
                "hours": "08 Hours",
                "topics": [
                    "Process Synchronization background",
                    "The Critical Section Problem",
                    "Peterson's Solution",
                    "Hardware support for synchronization (TestAndSet, Swap)",
                    "Semaphores (Counting & Binary, wait/signal)",
                    "Classic problems of synchronization: Producer-Consumer, Readers-Writers, Dining Philosophers",
                    "Monitors"
                ],
                "recommendedFiles": [
                    "OPERATING SYSTEM PART-1 (1).pdf",
                    "Final Question Bank-BCSOS303.pdf"
                ]
            },
            {
                "id": "os_m4",
                "name": "Module 4: Memory Management & Virtual Memory",
                "hours": "08 Hours",
                "topics": [
                    "Memory management background & address binding",
                    "Swapping & Contiguous memory allocation",
                    "Segmentation & Paging hardware",
                    "Structure of the Page Table (Hierarchical, Hashed, Inverted)",
                    "Virtual Memory background & Demand Paging",
                    "Copy-on-Write (COW)",
                    "Page Replacement Algorithms: FIFO, Optimal, LRU, Counting"
                ],
                "recommendedFiles": [
                    "Final Question Bank-BCSOS303.pdf"
                ]
            },
            {
                "id": "os_m5",
                "name": "Module 5: Deadlocks",
                "hours": "08 Hours",
                "topics": [
                    "Deadlock system model",
                    "Deadlock characterization (4 Necessary Conditions)",
                    "Resource Allocation Graph (RAG)",
                    "Methods for handling deadlocks",
                    "Deadlock prevention techniques",
                    "Deadlock avoidance: Banker's Algorithm (Safety & Resource Request)",
                    "Deadlock detection & Recovery mechanisms"
                ],
                "recommendedFiles": [
                    "Final Question Bank-BCSOS303.pdf"
                ]
            }
        ]
    },
    "BCIDS302": {
        "title": "Data Structures",
        "code": "BCIDS302",
        "sem": "3rd Semester",
        "scheme": "Autonomous Scheme 2024 / VTU",
        "modules": [
            {
                "id": "ds_m1",
                "name": "Module 1: Introduction, Pointers & Arrays",
                "hours": "08 Hours",
                "topics": [
                    "Data Structures classification & operations",
                    "Pointers and Dynamic Memory Allocation (malloc, calloc, realloc, free)",
                    "Data Abstraction & Abstract Data Types",
                    "Dynamically allocated Arrays",
                    "Sparse Matrix representation & Triplet transpose",
                    "Polynomial Representation and Addition",
                    "Pattern Matching: Naive & Knuth-Morris-Pratt (KMP) Algorithm",
                    "Sorting: Insertion Sort, Radix Sort"
                ],
                "recommendedFiles": [
                    "Data Structures Module-1(Notes).pdf",
                    "VTU Data Structures Notes CBCS by Nithin, VVCE.pdf",
                    "DS_BCIDS302_ Question Bank_2025.pdf",
                    "DS QB Student Copy.pdf"
                ]
            },
            {
                "id": "ds_m2",
                "name": "Module 2: Stacks & Queues",
                "hours": "08 Hours",
                "topics": [
                    "Stacks ADT & Array representation",
                    "Infix to Postfix expression conversion",
                    "Evaluation of Postfix expressions",
                    "Recursion: Tower of Hanoi, Factorial, Fibonacci",
                    "Queues ADT: Linear Queue & Circular Queue",
                    "Double Ended Queue (Deque) & Priority Queue",
                    "Multiple stacks and queues in single array"
                ],
                "recommendedFiles": [
                    "VTU Data Structures Notes CBCS by Nithin, VVCE.pdf",
                    "DS_BCIDS302_ Question Bank_2025.pdf",
                    "DS QB Student Copy.pdf"
                ]
            },
            {
                "id": "ds_m3",
                "name": "Module 3: Linked Lists",
                "hours": "08 Hours",
                "topics": [
                    "Linked lists introduction & Memory representation",
                    "Traversing and searching in Singly Linked List",
                    "Insertion and Deletion operations",
                    "Header Linked List & Circular Linked List",
                    "Doubly Linked List (Two-way linked list)",
                    "Linked list representation of Stacks and Queues",
                    "Polynomial addition using Linked Lists"
                ],
                "recommendedFiles": [
                    "VTU Data Structures Notes CBCS by Nithin, VVCE.pdf",
                    "DS_BCIDS302_ Question Bank_2025.pdf",
                    "DS QB Student Copy.pdf"
                ]
            },
            {
                "id": "ds_m4",
                "name": "Module 4: Trees & Binary Search Trees",
                "hours": "08 Hours",
                "topics": [
                    "Trees basic terminology & Binary Trees",
                    "Binary Tree Traversals: Preorder, Inorder, Postorder",
                    "Threaded Binary Trees",
                    "Binary Search Trees (BST): Insertion, Deletion, Search",
                    "Expression Trees",
                    "Heaps (Max Heap & Min Heap)"
                ],
                "recommendedFiles": [
                    "VTU Data Structures Notes CBCS by Nithin, VVCE.pdf",
                    "DS_BCIDS302_ Question Bank_2025.pdf",
                    "DS QB Student Copy.pdf"
                ]
            },
            {
                "id": "ds_m5",
                "name": "Module 5: Advanced Trees, Graphs & Hashing",
                "hours": "08 Hours",
                "topics": [
                    "AVL Trees & Rotations (LL, RR, LR, RL)",
                    "Red-Black Trees basics & Digital Search Trees",
                    "Graphs ADT & Representations (Adjacency Matrix / List)",
                    "Elementary Graph Operations: Breadth First Search (BFS), Depth First Search (DFS)",
                    "Hashing: Hash functions, Static & Dynamic Hashing",
                    "Collision Resolution: Open Addressing (Linear, Quadratic Probing), Chaining"
                ],
                "recommendedFiles": [
                    "VTU Data Structures Notes CBCS by Nithin, VVCE.pdf",
                    "DS_BCIDS302_ Question Bank_2025.pdf",
                    "DS QB Student Copy.pdf"
                ]
            }
        ]
    }
}

with open("assets/syllabus.json", "w", encoding="utf-8") as f:
    json.dump(syllabus, f, indent=2)

print("assets/syllabus.json written successfully!")
