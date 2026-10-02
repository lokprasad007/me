import os
import json
import hashlib
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont

os.makedirs('assets/thumbnails', exist_ok=True)

files = sorted(os.listdir('.'))
data = []

SUBJECT_MAP = {
    'OPERATING SYSTEM PART-1 (1).pdf': {
        'subject': 'Operating Systems',
        'code': 'BCSOS303',
        'title': 'Operating Systems Comprehensive Master Notes (Part 1)',
        'type': 'Master Notes',
        'badge': 'Core Subject',
        'author': 'Prof / Departmental Notes',
        'desc': 'Extensive, in-depth 257-page complete reference covering OS fundamentals, Process Management, CPU Scheduling Algorithms, Process Synchronization, Deadlocks, and System Calls.',
        'topics': ['Process Management', 'CPU Scheduling', 'Process Synchronization', 'Deadlocks', 'System Calls', 'Inter-process Communication', 'Semaphores', 'Monitors']
    },
    'OS Module 1 notes.pdf': {
        'subject': 'Operating Systems',
        'code': 'BCSOS303',
        'title': 'OS Module 1 Lecture Notes',
        'type': 'Lecture Notes',
        'badge': 'Module 1',
        'author': 'Prof. Kavitha D N (VVCE Mysore)',
        'desc': 'Clean, concise module notes explaining OS definition, computer system organization, OS structure, dual-mode operations, and kernel architecture with diagrams.',
        'topics': ['What is OS', 'Dual-Mode Operation', 'System Calls', 'Operating System Services', 'Monolithic vs Microkernel', 'Virtual Machines']
    },
    'OS-Module-1.pdf': {
        'subject': 'Operating Systems',
        'code': 'BCSOS303',
        'title': 'Silberschatz Galvin OS Module 1 Slides',
        'type': 'Slide Deck',
        'badge': 'Textbook Slides',
        'author': 'Silberschatz, Galvin & Gagne (9th Edition)',
        'desc': 'Official Silberschatz & Galvin 9th edition slide deck for Module 1, featuring diagrams of CPU/Memory architecture, hardware protection, interrupts, and system calls.',
        'topics': ['Silberschatz 9th Ed', 'System Architecture', 'Interrupt Handling', 'Storage Hierarchy', 'I/O Structure', 'Protection & Security']
    },
    'os-module1.pdf': {
        'subject': 'Operating Systems',
        'code': 'BCSOS303',
        'title': 'OS Module 1 Syllabus & Core Units',
        'type': 'Module Syllabus Notes',
        'badge': '8 Hours Syllabus',
        'author': 'Department of CSE',
        'desc': 'Standard 8-hour curriculum notes structured according to university syllabus units: OS operations, resource management, computing environments, and system booting.',
        'topics': ['8-Hour Syllabus', 'Resource Management', 'Clustered Systems', 'Distributed Systems', 'Virtualization', 'Booting Procedure']
    },
    'Final Question Bank-BCSOS303.pdf': {
        'subject': 'Operating Systems',
        'code': 'BCSOS303',
        'title': 'Operating Systems Final Exam Question Bank (2025-26)',
        'type': 'Question Bank',
        'badge': 'Exam Essential',
        'author': 'Dr. Madhusudhan H S (CSE / AIML)',
        'desc': 'Official VTU Autonomous Scheme question bank with Bloom’s Taxonomy levels (L1, L2, L3), Course Outcomes (CO1-CO5), marks distribution, and expected exam questions.',
        'topics': ['Bloom\'s Taxonomy', 'Module 1-5 Questions', 'Scheme 2024', 'Course Outcomes CO1-CO5', 'Exam Prep', 'Important Problems']
    },
    'VTU Data Structures Notes CBCS by Nithin, VVCE.pdf': {
        'subject': 'Data Structures',
        'code': 'BCIDS302',
        'title': 'VTU CBCS Data Structures Master Notes',
        'type': 'Master Notes',
        'badge': 'Complete Course',
        'author': 'Prof. Nithin (VVCE Mysore)',
        'desc': '111-page master reference handbook covering Arrays, Stacks, Queues, Linked Lists, Trees, Graphs, Sorting & Searching algorithms with complete C code implementations.',
        'topics': ['Stacks & Queues', 'Linked Lists (Singly, Doubly, Circular)', 'Binary Trees & BST', 'Graph Traversals (BFS/DFS)', 'Hashing', 'Sorting & Searching']
    },
    'Data Structures Module-1(Notes).pdf': {
        'subject': 'Data Structures',
        'code': 'BCIDS302',
        'title': 'Data Structures Module 1 Handwritten Notes',
        'type': 'Handwritten Notes',
        'badge': 'Module 1',
        'author': 'Faculty Scanned Copy',
        'desc': 'Clear handwritten notes for Module 1 detailing Pointers, Dynamic Memory Allocation (malloc, calloc, realloc, free), Structure definitions, and Stack ADT operations.',
        'topics': ['Dynamic Memory Allocation', 'Pointers & Arrays', 'Structures & Unions', 'Stack ADT', 'Infix to Postfix Conversion', 'Recursion']
    },
    'DS_BCIDS302_ Question Bank_2025.pdf': {
        'subject': 'Data Structures',
        'code': 'BCIDS302',
        'title': 'Data Structures Official CoE Question Bank (2025-26)',
        'type': 'Question Bank',
        'badge': 'Official CoE',
        'author': 'Controller of Examinations (CoE)',
        'desc': 'Faculty & CoE verified question bank under 2024 Scheme for BCIDS302, mapped with Course Outcomes, Program Outcomes, and Bloom\'s Taxonomy levels.',
        'topics': ['CoE Verified', 'Scheme 2024', 'Module 1 to 5', 'Course Outcomes CO1-CO5', 'Theory & Algorithms', 'Trace Questions']
    },
    'DS QB Student Copy.pdf': {
        'subject': 'Data Structures',
        'code': 'BCIDS302',
        'title': 'Data Structures Student Study Question Bank',
        'type': 'Question Bank',
        'badge': 'Student Edition',
        'author': 'Prof. Vignesh T V (Dept of AIML)',
        'desc': 'Curated student edition question bank with categorized choice questions, marks breakdown, and high-frequency university exam problems.',
        'topics': ['Student Study Guide', 'Frequent Exam Questions', 'Choice Structure', 'L1/L2/L3 Questions', 'Algorithm Tracing']
    },
    'chapter1 -AT.ppt': {
        'subject': 'Computer Architecture',
        'code': 'BCO304 / AT',
        'title': 'Chapter 1: Basic Structure of Computers (Slides)',
        'type': 'Presentation Slides',
        'badge': 'Architecture',
        'author': 'Carl Hamacher Curriculum',
        'desc': 'Lecture slide deck covering Functional Units, Memory Address/Data Registers (MAR/MDR), Bus Structures, Clock Rates, Performance Equations, and Byte Addressability.',
        'topics': ['Functional Units', 'MAR & MDR', 'Bus Structures', 'Processor Clock & Performance', 'Machine Instructions', 'Byte Addressable Memory']
    },
    'Data science and ml roadmap.pdf': {
        'subject': 'Career & Roadmap',
        'code': 'ROADMAP',
        'title': 'God-Level Data Science & ML Full-Stack Roadmap',
        'type': 'Career Roadmap',
        'badge': 'Career & Industry',
        'author': 'Himanshu Ramchandani',
        'desc': 'Actionable 8-month full-stack Data Science & Machine Learning engineering roadmap covering mathematics, Python, SQL, ML models, Deep Learning, MLOps, and portfolio building.',
        'topics': ['8-Month Plan', 'Python & Mathematics', 'Machine Learning Algorithms', 'Deep Learning & NLP', 'MLOps & Deployment', 'Portfolio & Projects']
    },
    'Academic Calendar for III & V Semester 2026-27_0001.pdf': {
        'subject': 'Academic Schedule',
        'code': 'VTU-CALENDAR',
        'title': 'Academic Calendar III & V Semester (2026-27)',
        'type': 'University Schedule',
        'badge': 'Official Calendar',
        'author': 'Registrar / Academic Senate',
        'desc': 'Official university academic calendar detailing semester commencement dates, CIE test windows, lab examination schedules, semester end exams, and vacation periods.',
        'topics': ['Semester Dates', 'CIE 1, 2, 3 Schedules', 'Last Working Day', 'Lab Exam Dates', 'Semester End Exams (SEE)', 'Academic Schedule']
    }
}

for f in files:
    if f.endswith('.pdf'):
        doc = fitz.open(f)
        page_count = len(doc)
        thumb_name = hashlib.md5(f.encode('utf-8')).hexdigest()[:12] + '.png'
        thumb_path = os.path.join('assets/thumbnails', thumb_name)
        try:
            pix = doc[0].get_pixmap(dpi=110)
            pix.save(thumb_path)
        except Exception as e:
            print(f'Thumbnail failed for {f}: {e}')
            thumb_name = ''
        
        extracted_text = []
        for p_idx in range(min(15, page_count)):
            extracted_text.append(doc[p_idx].get_text('text'))
        sample_text = ' '.join(extracted_text).replace('\n', ' ')
        # Clean text
        sample_clean = ' '.join(sample_text.split()[:400])

        meta = SUBJECT_MAP.get(f, {
            'subject': 'General',
            'code': 'REF',
            'title': f,
            'type': 'PDF Document',
            'badge': 'Resource',
            'author': 'Academic',
            'desc': 'Academic reference document.',
            'topics': []
        })

        data.append({
            'filename': f,
            'sizeBytes': os.path.getsize(f),
            'sizeFormatted': f"{os.path.getsize(f) / (1024 * 1024):.2f} MB" if os.path.getsize(f) >= 1024*1024 else f"{os.path.getsize(f) / 1024:.1f} KB",
            'pages': page_count,
            'thumbnail': 'assets/thumbnails/' + thumb_name,
            'subject': meta['subject'],
            'courseCode': meta['code'],
            'title': meta['title'],
            'type': meta['type'],
            'badge': meta['badge'],
            'author': meta['author'],
            'description': meta['desc'],
            'topics': meta['topics'],
            'searchSnippet': sample_clean,
            'extension': 'pdf'
        })
        doc.close()

    elif f.endswith('.ppt'):
        thumb_name = 'thumb_ppt.png'
        thumb_path = os.path.join('assets/thumbnails', thumb_name)
        img = Image.new('RGB', (700, 480), color=(15, 23, 42))
        d = ImageDraw.Draw(img)
        # Background gradient effect / rectangles
        d.rectangle([10, 10, 690, 470], fill=(22, 33, 62), outline=(99, 102, 241), width=3)
        d.rectangle([25, 25, 675, 75], fill=(30, 41, 79))
        d.text((40, 40), 'PRESENTATION SLIDES - CHAPTER 1', fill=(129, 140, 248))
        d.text((40, 110), 'Basic Structure of Computers', fill=(255, 255, 255))
        d.text((40, 150), 'Computer Architecture & Organization', fill=(148, 163, 184))
        d.line([(40, 195), (660, 195)], fill=(71, 85, 105), width=2)
        d.text((40, 220), 'Key Topics Covered:', fill=(245, 158, 11))
        d.text((50, 260), '1. Functional Units: ALU, CU, Memory (MAR, MDR), I/O', fill=(226, 232, 240))
        d.text((50, 295), '2. Interconnection & Bus Structures (Speed vs Efficiency)', fill=(226, 232, 240))
        d.text((50, 330), '3. Processor Clock, Timing Signals & Clock Rates', fill=(226, 232, 240))
        d.text((50, 365), '4. Instruction Execution Steps & Basic Performance Equation', fill=(226, 232, 240))
        d.text((50, 400), '5. Memory Locations, 24/32-Bit Space & Byte Addressability', fill=(226, 232, 240))
        img.save(thumb_path)

        meta = SUBJECT_MAP.get(f, {
            'subject': 'Computer Architecture',
            'code': 'BCO304 / AT',
            'title': 'Chapter 1: Basic Structure of Computers (Slides)',
            'type': 'Presentation Slides',
            'badge': 'Architecture',
            'author': 'Carl Hamacher Curriculum',
            'desc': 'Lecture slide deck covering Functional Units, Memory Address/Data Registers (MAR/MDR), Bus Structures, Clock Rates, Performance Equations, and Byte Addressability.',
            'topics': ['Functional Units', 'MAR & MDR', 'Bus Structures', 'Processor Clock & Performance', 'Machine Instructions', 'Byte Addressable Memory']
        })

        data.append({
            'filename': f,
            'sizeBytes': os.path.getsize(f),
            'sizeFormatted': f"{os.path.getsize(f) / (1024 * 1024):.2f} MB",
            'pages': 'Slides',
            'thumbnail': 'assets/thumbnails/' + thumb_name,
            'subject': meta['subject'],
            'courseCode': meta['code'],
            'title': meta['title'],
            'type': meta['type'],
            'badge': meta['badge'],
            'author': meta['author'],
            'description': meta['desc'],
            'topics': meta['topics'],
            'searchSnippet': 'Functional Units ALU CU Memory MAR MDR Bus Structures Clock Rate Performance Equation Byte Addressable Memory',
            'extension': 'ppt'
        })

with open('assets/data.json', 'w', encoding='utf-8') as out:
    json.dump(data, out, indent=2)

print(f"Successfully indexed {len(data)} files and generated thumbnails in assets/thumbnails/!")
