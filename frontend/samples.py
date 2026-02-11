"""Sample call transcripts for the UI dropdown."""
from __future__ import annotations

from typing import List, NamedTuple, Optional


class Sample(NamedTuple):
    id: str
    label: str
    transcript: str


SAMPLES: List[Sample] = [
    Sample(
        id="scheduling",
        label="Scheduling – book appointment",
        transcript="Hi, I need to book an appointment with Dr. Chen. I’ve been having headaches for about two weeks and I’d like to get it checked. I’m free Thursday afternoon or Friday morning. My insurance is Blue Cross.",
    ),
    Sample(
        id="billing",
        label="Billing – question about charge",
        transcript="I got a bill for $250 from my last visit and I don’t understand what it’s for. I thought my insurance covered the visit. Can someone explain the charges? My member ID is XYZ123.",
    ),
    Sample(
        id="refill",
        label="Refill – prescription renewal",
        transcript="I need a refill on my blood pressure medication, lisinopril. The bottle says I have two refills left. I’m almost out. Can you send it to the CVS on Main Street?",
    ),
    Sample(
        id="symptoms_routine",
        label="Symptoms – routine (cold)",
        transcript="I’ve had a runny nose and a bit of a cough for about five days. No fever. I’m just wondering if I need to come in or if rest and fluids are enough. I don’t have any other health issues.",
    ),
    Sample(
        id="symptoms_er",
        label="Symptoms – possible red flag (chest pain)",
        transcript="I’ve been having chest pain for the last hour. It’s pressure in the center of my chest and it goes to my left arm. I’m also a bit short of breath. I’m 58 and I have a history of high blood pressure. Should I go to the ER?",
    ),
]


def get_sample_by_id(sample_id: str) -> Optional[Sample]:
    for s in SAMPLES:
        if s.id == sample_id:
            return s
    return None
