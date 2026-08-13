from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven configuration. Nothing here has a production default."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---------------------------------------------------------------
    app_name: str = "OutreachHalo API"
    environment: str = "development"
    app_url: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000"

    # --- Database ----------------------------------------------------------
    # Supabase gives you this under Project Settings → Database → Connection string.
    # Use the pooled (pgbouncer) URI in serverless environments.
    database_url: str = ""

    # --- Supabase auth -----------------------------------------------------
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    # HS256 secret used to sign Supabase access tokens (Settings → API → JWT Secret).
    supabase_jwt_secret: str = ""
    supabase_jwt_audience: str = "authenticated"

    # --- AI provider -------------------------------------------------------
    # "auto" picks Anthropic when its key is present, otherwise Gemini. Set it
    # explicitly to pin one provider while both keys are configured.
    ai_provider: str = "auto"  # auto | anthropic | gemini

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-4-8"
    anthropic_max_tokens: int = 1500

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # --- Stripe ------------------------------------------------------------
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_pro: str = ""
    stripe_price_growth: str = ""

    # --- Behaviour ---------------------------------------------------------
    scrape_timeout_seconds: int = 12
    scrape_max_chars: int = 12000

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def has_database(self) -> bool:
        return bool(self.database_url)

    @property
    def has_anthropic(self) -> bool:
        return bool(self.anthropic_api_key)

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def active_ai_provider(self) -> str | None:
        """Which provider will actually serve a generation, or None if unconfigured."""
        choice = (self.ai_provider or "auto").strip().lower()

        if choice == "anthropic":
            return "anthropic" if self.has_anthropic else None
        if choice == "gemini":
            return "gemini" if self.has_gemini else None

        # auto — Anthropic wins when both are present.
        if self.has_anthropic:
            return "anthropic"
        if self.has_gemini:
            return "gemini"
        return None

    @property
    def has_ai(self) -> bool:
        return self.active_ai_provider is not None

    @property
    def active_ai_model(self) -> str | None:
        provider = self.active_ai_provider
        if provider == "anthropic":
            return self.anthropic_model
        if provider == "gemini":
            return self.gemini_model
        return None

    @property
    def has_stripe(self) -> bool:
        return bool(self.stripe_secret_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
