# backend/models.py
from datetime import datetime
from database import db

# =========================
# USER MODEL (UPDATED)
# =========================
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    # 🔐 Role-based access
    role = db.Column(db.String(20), default="user")
    # values: "user", "admin"

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    uploads = db.relationship("KPIRecord", backref="user", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


# =========================
# KPI RECORD MODEL
# =========================
class KPIRecord(db.Model):
    __tablename__ = "kpi_records"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # -------- File & Company Profile --------
    file_name = db.Column(db.String(200))
    company_name = db.Column(db.String(200))
    industry = db.Column(db.String(100))
    reporting_period = db.Column(db.String(100))
    currency = db.Column(db.String(10))

    # -------- Basic KPIs --------
    revenue = db.Column(db.Float)
    profit = db.Column(db.Float)
    eps = db.Column(db.Float)
    cash_flow = db.Column(db.Float)

    # -------- Advanced KPIs --------
    ebitda = db.Column(db.Float)
    ebit = db.Column(db.Float)
    pbt = db.Column(db.Float)
    total_expense = db.Column(db.Float)
    gross_profit = db.Column(db.Float)

    # -------- Balance Sheet --------
    total_assets = db.Column(db.Float)
    total_liabilities = db.Column(db.Float)
    shareholders_equity = db.Column(db.Float)
    total_debt = db.Column(db.Float)
    current_assets = db.Column(db.Float)
    current_liabilities = db.Column(db.Float)
    inventory = db.Column(db.Float)
    cogs = db.Column(db.Float)

    # -------- Financial Ratios --------
    gross_margin = db.Column(db.Float)
    net_profit_margin = db.Column(db.Float)
    operating_margin = db.Column(db.Float)
    ebitda_margin = db.Column(db.Float)
    debt_to_equity = db.Column(db.Float)
    current_ratio = db.Column(db.Float)
    quick_ratio = db.Column(db.Float)
    roa = db.Column(db.Float)
    roe = db.Column(db.Float)
    sales_growth_percent = db.Column(db.Float)

    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    # -------- Serialization --------
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "file_name": self.file_name,

            # company profile
            "company_name": self.company_name,
            "industry": self.industry,
            "reporting_period": self.reporting_period,
            "currency": self.currency,

            # KPIs
            "revenue": self.revenue,
            "profit": self.profit,
            "eps": self.eps,
            "cash_flow": self.cash_flow,
            "ebitda": self.ebitda,
            "ebit": self.ebit,
            "pbt": self.pbt,
            "total_expense": self.total_expense,
            "gross_profit": self.gross_profit,

            # balance sheet
            "total_assets": self.total_assets,
            "total_liabilities": self.total_liabilities,
            "shareholders_equity": self.shareholders_equity,
            "total_debt": self.total_debt,
            "current_assets": self.current_assets,
            "current_liabilities": self.current_liabilities,
            "inventory": self.inventory,
            "cogs": self.cogs,

            # ratios
            "gross_margin": self.gross_margin,
            "net_profit_margin": self.net_profit_margin,
            "operating_margin": self.operating_margin,
            "ebitda_margin": self.ebitda_margin,
            "debt_to_equity": self.debt_to_equity,
            "current_ratio": self.current_ratio,
            "quick_ratio": self.quick_ratio,
            "roa": self.roa,
            "roe": self.roe,
            "sales_growth_percent": self.sales_growth_percent,

            # explainability
            "traces": [t.serialize() for t in self.traces],

            "upload_date": self.upload_date.strftime("%Y-%m-%d %H:%M:%S"),
        }

    def __repr__(self):
        return f"<KPIRecord File={self.file_name} User={self.user_id}>"


# =========================
# KPI TRACEABILITY MODEL
# =========================
class KPITrace(db.Model):
    """
    Stores explainability & traceability info
    for each extracted KPI.
    """

    __tablename__ = "kpi_traces"

    id = db.Column(db.Integer, primary_key=True)

    kpi_name = db.Column(db.String(64), nullable=False)
    value = db.Column(db.Float)

    source_type = db.Column(db.String(20))  # "text" or "table"
    page_number = db.Column(db.Integer)
    matched_text = db.Column(db.Text)

    confidence = db.Column(db.Float)

    record_id = db.Column(
        db.Integer,
        db.ForeignKey("kpi_records.id"),
        nullable=False
    )

    record = db.relationship(
        "KPIRecord",
        backref=db.backref("traces", lazy=True)
    )

    def serialize(self):
        return {
            "kpi_name": self.kpi_name,
            "value": self.value,
            "source_type": self.source_type,
            "page_number": self.page_number,
            "matched_text": self.matched_text,
            "confidence": self.confidence,
        }

    def __repr__(self):
        return f"<KPITrace {self.kpi_name} Page={self.page_number}>"


# =========================
# ADMIN AUDIT LOG MODEL (NEW)
# =========================
class AuditLog(db.Model):
    """
    Tracks admin actions for security & compliance
    """

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)

    action = db.Column(db.String(255), nullable=False)
    performed_by = db.Column(db.Integer, db.ForeignKey("user.id"))
    target_type = db.Column(db.String(50))   # user / kpi / file
    target_id = db.Column(db.Integer)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    admin = db.relationship("User")

    def serialize(self):
        return {
            "id": self.id,
            "action": self.action,
            "performed_by": self.performed_by,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        }

    def __repr__(self):
        return f"<AuditLog {self.action} by {self.performed_by}>"
