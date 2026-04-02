/* NEXUSNODE AI - UPDATED DATABASE BLUEPRINT 
  Modules: Auth, Workspaces, Documents, Privacy, Chat, Study Tools
*/

-- USERS & ACCESS
CREATE TABLE Users (
    u_id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    pwd_hash TEXT,
    created_at TIMESTAMP
);

-- ORGANIZATION
CREATE TABLE Workspaces (
    w_id UUID PRIMARY KEY,
    owner_id UUID REFERENCES Users(u_id),
    name VARCHAR(100),
    is_archived BOOLEAN DEFAULT FALSE
);

-- DOCUMENT METADATA
CREATE TABLE Documents (
    d_id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES Workspaces(w_id),
    original_name VARCHAR(255),
    secure_url TEXT, -- Redacted version storage
    raw_text_ref TEXT, -- Reference to encrypted raw text
    status ENUM('redacting', 'indexing', 'ready')
);

-- PRIVACY LOGS (The FYP Signature)
CREATE TABLE RedactionAudit (
    audit_id UUID PRIMARY KEY,
    doc_id UUID REFERENCES Documents(d_id),
    pii_types_found JSONB, -- e.g., ["EMAIL", "SSN", "PHONE"]
    redacted_at TIMESTAMP
);

-- CHAT SYSTEM
CREATE TABLE Chats (
    c_id UUID PRIMARY KEY,
    user_id UUID REFERENCES Users(u_id),
    doc_id UUID REFERENCES Documents(d_id),
    history JSONB -- Array of {role, content, citations}
);