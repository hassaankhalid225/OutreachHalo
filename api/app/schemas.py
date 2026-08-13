from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, field_validator

Channel = Literal["linkedin", "email"]
IntentLevel = Literal["hot", "warm", "cold"]
IntentTag = Literal["interested", "question", "not_now", "neutral"]
ApprovalMode = Literal["approve_first", "approve_all", "autopilot"]
Provider = Literal["linkedin", "gmail", "outlook", "google_workspace"]
PostStatus = Literal["draft", "scheduled", "posted"]
SequenceStatus = Literal["draft", "active", "paused"]
PlanId = Literal["pro", "growth", "custom"]


# --- Onboarding -------------------------------------------------------------


class AnalyzeWebsiteRequest(BaseModel):
    url: HttpUrl


class AnalyzeWebsiteResponse(BaseModel):
    what_you_sell: str
    who_you_target: str
    how_to_pitch: str


class BusinessProfileRequest(BaseModel):
    website_url: str | None = None
    what_you_sell: str | None = None
    who_you_target: str | None = None
    how_to_pitch: str | None = None


class IcpRequest(BaseModel):
    job_titles: list[str] = Field(default_factory=list, max_length=30)
    company_size_min: int = Field(default=1, ge=1, le=100_000)
    company_size_max: int = Field(default=250, ge=1, le=100_000)
    industries: list[str] = Field(default_factory=list, max_length=30)
    geographies: list[str] = Field(default_factory=list, max_length=30)
    keywords: list[str] = Field(default_factory=list, max_length=30)

    @field_validator("company_size_max")
    @classmethod
    def check_range(cls, value: int, info):
        minimum = info.data.get("company_size_min", 1)
        if value < minimum:
            raise ValueError("company_size_max must be greater than company_size_min")
        return value


# --- Accounts + agents ------------------------------------------------------


class ConnectAccountRequest(BaseModel):
    provider: Provider


class AccountPatch(BaseModel):
    daily_cap: int | None = Field(default=None, ge=1, le=100)
    account_label: str | None = None


class AgentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class AgentPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    status: Literal["active", "paused"] | None = None
    approval_mode: ApprovalMode | None = None
    daily_cap: int | None = Field(default=None, ge=1, le=100)
    tone: str | None = Field(default=None, max_length=200)


# --- Prospects --------------------------------------------------------------


class FeedbackRequest(BaseModel):
    is_good_fit: bool


class AddToSequenceRequest(BaseModel):
    sequence_id: str


# --- Sequences --------------------------------------------------------------


class SequenceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class SequenceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    status: SequenceStatus | None = None
    approval_mode: ApprovalMode | None = None


class StepInput(BaseModel):
    step_order: int = Field(ge=1, le=50)
    channel: Channel
    delay_days: int = Field(ge=0, le=90)
    subject: str | None = Field(default=None, max_length=200)
    message_template: str = Field(min_length=1, max_length=4000)
    ai_personalize: bool = True


class StepsRequest(BaseModel):
    steps: list[StepInput] = Field(min_length=1, max_length=20)


class EnrollRequest(BaseModel):
    prospect_ids: list[str] = Field(min_length=1, max_length=500)


# --- Inbox ------------------------------------------------------------------


class ReplyRequest(BaseModel):
    body: str = Field(min_length=1, max_length=8000)
    ai_generated: bool = False
    channel: Channel = "linkedin"


class GenerateReplyRequest(BaseModel):
    prospect_name: str | None = None
    prospect_title: str | None = None
    company: str | None = None
    signals: list[str] = Field(default_factory=list)
    intent_tag: str = "neutral"
    history: list[dict] = Field(default_factory=list)
    booking_url: str | None = None


class AutopilotRequest(BaseModel):
    enabled: bool


class IntentRequest(BaseModel):
    intent_tag: IntentTag


# --- Content ----------------------------------------------------------------


class VoiceSampleRequest(BaseModel):
    sample_text: str = Field(min_length=40, max_length=8000)


class PostCreate(BaseModel):
    body_text: str = Field(min_length=1, max_length=4000)
    status: PostStatus = "draft"
    scheduled_at: str | None = None


class PostPatch(BaseModel):
    body_text: str | None = Field(default=None, min_length=1, max_length=4000)
    status: PostStatus | None = None
    scheduled_at: str | None = None


class GeneratePostRequest(BaseModel):
    brief: str = Field(min_length=1, max_length=600)
    voice_sample: str | None = None
    what_you_sell: str | None = None
    audience: str | None = None


# --- Settings + team --------------------------------------------------------


class SettingsPatch(BaseModel):
    booking_url: str | None = None
    timezone: str | None = Field(default=None, max_length=64)
    sending_hours_start: int | None = Field(default=None, ge=0, le=23)
    sending_hours_end: int | None = Field(default=None, ge=0, le=23)
    notify_hot_reply: bool | None = None
    notify_daily_digest: bool | None = None
    notify_product_updates: bool | None = None


class InviteRequest(BaseModel):
    email: str = Field(max_length=254)
    role: Literal["admin", "member"] = "member"

    @field_validator("email")
    @classmethod
    def check_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email address")
        return value.lower().strip()


# --- Billing ----------------------------------------------------------------


class CheckoutRequest(BaseModel):
    plan: PlanId


# --- Public tools -----------------------------------------------------------


class ToolRequest(BaseModel):
    kind: Literal["cold_email", "linkedin_post", "icp", "linkedin_message", "email_sequence"]
    input: dict[str, str] = Field(default_factory=dict)

    @field_validator("input")
    @classmethod
    def limit_size(cls, value: dict[str, str]) -> dict[str, str]:
        if len(value) > 12:
            raise ValueError("Too many fields")
        for key, item in value.items():
            if len(item) > 4000:
                raise ValueError(f"Field {key} is too long")
        return value


class GeneratedText(BaseModel):
    text: str
