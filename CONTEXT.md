# Whisky Finder

A boutique whisky shop for the Bulgarian market: a short selected list, store-written tasting, and a Finder that recommends three Whiskies.

**Whisky Finder**:
The shop. Public site: whiskyfinder.bg. Contact: 0876473165, info@whiskyfinder.bg.
_Avoid_: whisky (as the shop’s name), boutique (as the name)

## Catalogue

**Whisky**:
The liquid people talk about — a named expression such as GlenAllachie 12. Listing one requires a bottle photo, a House tasting, Origin, and at least one SKU. The Finder, House pick, and awards attach here.
_Avoid_: SKU, bottle, product, item (when meaning the liquid)

**SKU**:
A sellable size of one Whisky, such as a 700ml bottle. The cart sells SKUs. Each SKU has a quantity and an Availability.
_Avoid_: Whisky, product (when meaning the liquid)

**Pack**:
A SKU that contains several Whiskies, such as a gift set or a 50ml discovery pack.
_Avoid_: Whisky

**Origin**:
The family a Whisky belongs to: Irish, Scotch, Bourbon, or Japanese. Filtered on the catalogue, not in the Finder.
_Avoid_: category, type, region (when meaning these four)

**Catalogue**:
A list of Whiskies (not SKUs), filterable by Origin and Flavour tags. The price shown is the In-stock SKU **Buy** would use; if none, an Ask-us SKU.
_Avoid_: product grid, SKU list, shop (when meaning this list)

## Tasting

**House tasting**:
The shop’s canonical nose, taste, and aftertaste (written in Bulgarian), plus Flavour tags, Sweetness, and Smoke for a Whisky. The Finder uses only this.
_Avoid_: review, rating, category, tasting notes (as a dump for both shop and visitors)

**Tasting**:
A visitor’s own scores and notes for a Whisky. Not used by the Finder.
_Avoid_: House tasting, review

**Flavour tag**:
A closed Bulgarian flavour word on a Whisky that a Customer can tick in the Finder. The list is: ванилия, мед, карамел, шоколад, сушени плодове, цитрус, ябълка, круша, тропически. Customers cannot invent tags.
_Avoid_: tasting note, category, tag, English flavour names as the tick list

**Sweetness**:
A single House-tasting scale on a Whisky: сухо, балансирано, or сладко.

**Smoke**:
A single House-tasting scale on a Whisky: без, лек, среден, or силен.

**Finder**:
One screen: Flavour tags (at least one), Sweetness (one), Smoke (one). It returns up to three Whiskies, ranked, with **Buy** or **Ask us**. **Buy** uses an In-stock SKU; size can be changed on the Whisky page. It does not show a match percent.
_Avoid_: quiz, search, five-question wizard, recommender, “92% match”

**Match**:
Coverage of the Customer’s selected Finder answers (ticked Flavour tags + Sweetness + Smoke) that the Whisky’s House tasting also has: matches ÷ selected. Extra tags on the Whisky do not reduce coverage. Example: 4 of 5 selected answers present → 80%. Used only to rank. Never shown as a percent. In-stock Whiskies are listed before those that are not, then by Match.
_Avoid_: likelihood, score, AI, displayed percentage

**House pick**:
The one Whisky currently featured on the home, with a short story written by the shop. Editorial, not an award. Replaced when the shop has a new story; the home may name the month, but the calendar does not rotate it.
_Avoid_: whisky of the month (as a contest), award, trophy, winner

## Commerce

**Customer**:
An adult in Bulgaria buying for themselves, usually a curious beginner. They pass a one-time 18+ splash, then may browse. They may check out as a guest or as a Member.
_Avoid_: user, client, buyer

**Account**:
Optional login for a Customer. Checkout does not require it.
_Avoid_: profile, user

**Member**:
A Customer who has an Account.
_Avoid_: subscriber, user

**Points**:
A running total on a Member, increased only by paid In-stock Orders. The Member can see the balance. Points cannot be spent yet. Not increased by Waitlist, Ask us, or Tasting.
_Avoid_: coins, cashback, community points, voucher

**Member price**:
A second price the shop sets by hand on a SKU, shown to Members. Not a campaign engine.
_Avoid_: discount code, coupon, exclusive offer (as a system)

**Order**:
A confirmed purchase of In-stock SKUs, paid by card now or by cash on delivery.
_Avoid_: cart, transaction, payment

**Delivery**:
Courier shipment of an Order to an address in Bulgaria. There is no shop pickup.
_Avoid_: collection, click and collect, store pickup

**Availability**:
Whether a SKU can be bought now. The Customer sees two paths only: **In stock** (**Buy**) or **Ask us** (**Waitlist**). **On request** (the shop is not holding it) and **Sold out** (quantity is zero; the SKU stays listed) are shop notes for why it is not In stock, not Customer-facing labels.
_Avoid_: status, stock (when meaning this split)

**Ask us**:
The only Customer action on a SKU that is not In stock: join the Waitlist.
_Avoid_: Buy, contact, back-order, enquire

**Waitlist**:
A Customer request to be told when a SKU becomes In stock. Email is required; phone is optional. A Member’s Account email is used. No payment until it is In stock. When the SKU becomes In stock, one email goes to everyone on that Waitlist and those entries are cleared.
_Avoid_: back-order, reservation, ask-to-source

**Shopkeeper**:
The one person who lists Whiskies, sets House tasting, House pick, quantity, Member price, and packs Orders. No other staff logins.
_Avoid_: admin, user, staff, warehouse
