# Use live AI research for every Finder run

The Finder uses OpenRouter with a freely configurable model ID, initially GPT-5.6 Terra, and performs fresh approved-domain web research without a cache on every run. AI is the source of truth for relevance, while the application enforces Catalogue IDs, Price tiers, result limits, and Buy/Ask-us actions; sources are neither stored nor shown, and failure produces an honest retryable error rather than fallback results.

This replaces curated Finder profiles and Shopkeeper approval because fresh public knowledge and zero manual knowledge maintenance are preferred over reproducibility, predictable latency, and deterministic ranking. Global routing uses no Customer identity, denies provider data collection, and requests zero data retention; changing to an incompatible model may make the Finder fail visibly. The Shopkeeper changes the model through one settings text field rather than a model-management system.
