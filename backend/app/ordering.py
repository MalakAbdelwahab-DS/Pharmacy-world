"""Paid placement rules, in one place so they are easy to change after Dr. Sakher's answers.

- A product with a priority is sponsored. A higher priority number means a higher placement.
- At most MAX_SPONSORED sponsored products go to the top of a list, each labelled "Sponsored".
- Every other product keeps its normal order.
- "Same medicine" alternatives never use this: they are sorted by price.
"""

MAX_SPONSORED = 2


def with_sponsored_first(items):
    sponsored = sorted((i for i in items if i["sponsored"]), key=lambda i: -i["priority"])[:MAX_SPONSORED]
    top_ids = {i["id"] for i in sponsored}
    return sponsored + [i for i in items if i["id"] not in top_ids]
