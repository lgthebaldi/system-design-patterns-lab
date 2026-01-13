# services/week-4-financial-service/main.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Data Model
class InvestmentRequest(BaseModel):
    principal: float
    rate: float
    years: int

@app.get("/")
def read_root():
    return {"service": "Financial Microservice", "status": "Active", "version": "1.0"}

@app.post("/calculate-compound")
def calculate_compound_interest(data: InvestmentRequest):
    """
    Complex calculation simulation.
    Formula: A = P(1 + r/n)^(nt)
    """
    # Simulate processing logic
    amount = data.principal * ((1 + (data.rate / 100)) ** data.years)
    
    return {
        "principal": data.principal,
        "rate_percent": data.rate,
        "years": data.years,
        "final_amount": round(amount, 2),
        "currency": "USD"
    }

# To run: uvicorn main:app --reload --port 8000