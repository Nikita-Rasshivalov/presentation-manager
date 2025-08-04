CREATE TABLE IF NOT EXISTS user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name ENUM('CREATOR', 'EDITOR', 'VIEWER') NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS presentations (
    id CHAR(36) PRIMARY KEY, 
    title VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS slides (
    id CHAR(36) PRIMARY KEY,
    presentation_id CHAR(36) NOT NULL,
    slide_index INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE,
    INDEX idx_presentation_slide_index (presentation_id, slide_index)
);

CREATE TABLE IF NOT EXISTS slide_elements (
    id CHAR(36) PRIMARY KEY,
    slide_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    width FLOAT NOT NULL,
    height FLOAT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (slide_id) REFERENCES slides(id) ON DELETE CASCADE,
    INDEX idx_element_slide (slide_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id CHAR(36) PRIMARY KEY,
    nickname VARCHAR(64) NOT NULL,
    socket_id VARCHAR(128),
    role ENUM('CREATOR', 'EDITOR', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    presentation_id CHAR(36),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE SET NULL,
    INDEX idx_session_presentation (presentation_id)
);
