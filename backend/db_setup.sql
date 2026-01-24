-- Create database
CREATE DATABASE IF NOT EXISTS interviewmate;
USE interviewmate;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT DEFAULT NULL,
    college VARCHAR(150) DEFAULT NULL,
    major VARCHAR(100) DEFAULT NULL,
    graduation_year INT DEFAULT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    topic VARCHAR(100) NOT NULL,
    summary TEXT,
    notes TEXT,
    points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_difficulty (difficulty),
    INDEX idx_topic (topic)
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    file_url TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Groups table (escape reserved keyword)
CREATE TABLE IF NOT EXISTS `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_by INT NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    max_members INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_invite_code (invite_code)
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id)
);

-- Contests table
CREATE TABLE IF NOT EXISTS contests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    max_submissions_per_problem INT DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_group_id (group_id),
    INDEX idx_contest_active (is_active)
);

-- Contest problems
CREATE TABLE IF NOT EXISTS contest_problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    leetcode_number VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    prompt TEXT NOT NULL,
    function_signature VARCHAR(255) NOT NULL,
    base_points INT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    INDEX idx_contest_id (contest_id)
);

-- Contest testcases (JSON payloads for function-style evaluation)
CREATE TABLE IF NOT EXISTS contest_testcases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_problem_id INT NOT NULL,
    input_json TEXT NOT NULL,
    expected_output_json TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_problem_id) REFERENCES contest_problems(id) ON DELETE CASCADE,
    INDEX idx_contest_problem_id (contest_problem_id)
);

-- Contest participants
CREATE TABLE IF NOT EXISTS contest_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (contest_id, user_id)
);

-- Contest submissions
CREATE TABLE IF NOT EXISTS contest_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contest_id INT NOT NULL,
    contest_problem_id INT NOT NULL,
    user_id INT NOT NULL,
    language ENUM('python', 'java') NOT NULL,
    code TEXT NOT NULL,
    verdict ENUM('AC', 'WA', 'TLE', 'RE', 'CE') NOT NULL,
    runtime_ms INT DEFAULT NULL,
    elapsed_seconds INT DEFAULT 0,
    score_awarded DECIMAL(10,3) DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (contest_problem_id) REFERENCES contest_problems(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submission_lookup (contest_id, contest_problem_id, user_id),
    INDEX idx_submission_time (submitted_at)
);
