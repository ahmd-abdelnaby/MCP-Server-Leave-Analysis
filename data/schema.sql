-- SQL Server Schema for Leave Analysis

-- Employees
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'employees')
BEGIN
    CREATE TABLE employees (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        department NVARCHAR(100) NOT NULL,
        manager_id NVARCHAR(50) NULL,
        annual_leave_days INT DEFAULT 21,
        sick_leave_days INT DEFAULT 14,
        join_date DATE NOT NULL,
        CONSTRAINT FK_Manager FOREIGN KEY (manager_id) REFERENCES employees(id)
    );
END

-- Leave Balances
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'leave_balances')
BEGIN
    CREATE TABLE leave_balances (
        employee_id NVARCHAR(50) NOT NULL,
        leave_type NVARCHAR(50) NOT NULL, -- 'annual', 'sick', 'maternity', 'unpaid'
        year INT NOT NULL,
        total_days INT NOT NULL,
        used_days INT DEFAULT 0,
        pending_days INT DEFAULT 0,
        PRIMARY KEY (employee_id, leave_type, year),
        CONSTRAINT FK_EmployeeBalance FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
END

-- Leave Requests
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'leave_requests')
BEGIN
    CREATE TABLE leave_requests (
        id NVARCHAR(50) PRIMARY KEY,
        employee_id NVARCHAR(50) NOT NULL,
        leave_type NVARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        working_days INT NOT NULL,
        reason NVARCHAR(MAX),
        status NVARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
        submitted_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
        reviewed_by NVARCHAR(50),
        reviewed_at DATETIMEOFFSET,
        notes NVARCHAR(MAX),
        CONSTRAINT FK_EmployeeRequest FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
END

-- Leave Policies
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'leave_policies')
BEGIN
    CREATE TABLE leave_policies (
        id NVARCHAR(50) PRIMARY KEY,
        leave_type NVARCHAR(50) NOT NULL,
        rule_name NVARCHAR(100) NOT NULL,
        rule_value NVARCHAR(MAX) NOT NULL, -- JSON encoded rule
        description NVARCHAR(500)
    );
END

-- Public Holidays
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'public_holidays')
BEGIN
    CREATE TABLE public_holidays (
        holiday_date DATE PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        country NVARCHAR(50) DEFAULT 'SA'
    );
END
