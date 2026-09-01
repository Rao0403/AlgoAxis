USE interviewmate;

ALTER TABLE problems
    ADD COLUMN status ENUM('To-Do', 'In Progress', 'Solved', 'Revisit') NOT NULL DEFAULT 'Solved' AFTER topic,
    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
    ADD INDEX idx_status (status),
    ADD INDEX idx_user_status (user_id, status);

CREATE TABLE IF NOT EXISTS problem_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    user_id INT NOT NULL,
    approach TEXT,
    solution_code MEDIUMTEXT,
    time_complexity VARCHAR(100),
    space_complexity VARCHAR(100),
    key_insights TEXT,
    mistakes_made TEXT,
    related_problems TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_problem_user_note (problem_id, user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_user_id (user_id)
);
