from app.db import query
from app.ordering import with_sponsored_first


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_search_by_ingredient(client):
    body = client.get("/medicines/search", params={"q": "paracetamol"}).json()
    assert body["total"] > 0
    assert all("paracetamol" in r["ingredients"].lower() for r in body["results"])


def test_search_typo_suggests_name(client):
    body = client.get("/medicines/search", params={"q": "Abizoll"}).json()
    assert body["total"] > 0 or body["did_you_mean"] == "Abizol"


def test_search_nothing(client):
    body = client.get("/medicines/search", params={"q": "zzqqxx"}).json()
    assert body["total"] == 0


def test_detail_and_packs(client):
    first = client.get("/medicines/search", params={"q": "abizol"}).json()["results"][0]
    body = client.get(f"/medicines/{first['id']}").json()
    assert body["manufacturer"] and body["packs"]
    assert client.get("/medicines/999999").status_code == 404


def test_same_medicine_sorted_by_price_not_priority(client):
    # Find a product that has at least two "same medicine" alternatives with prices
    rows = query(
        """SELECT a.id FROM medicine_cards a JOIN medicine_cards b
             ON a.signature = b.signature AND lower(a.strength_text) = lower(b.strength_text)
            AND a.dosage_form = b.dosage_form AND a.id <> b.id
           WHERE b.price_per_unit IS NOT NULL
           GROUP BY a.id HAVING count(*) >= 2 LIMIT 1"""
    )
    assert rows, "sample data should contain same-medicine groups"
    same = client.get(f"/medicines/{rows[0]['id']}/alternatives").json()["same_medicine"]
    prices = [s["price_per_unit"] for s in same if s["price_per_unit"] is not None]
    assert prices == sorted(prices)


def test_sponsored_rule():
    items = [
        {"id": 1, "sponsored": False, "priority": None},
        {"id": 2, "sponsored": True, "priority": 1},
        {"id": 3, "sponsored": True, "priority": 5},
        {"id": 4, "sponsored": True, "priority": 3},
    ]
    assert [i["id"] for i in with_sponsored_first(items)] == [3, 4, 1, 2]


def test_browse(client):
    cats = client.get("/categories").json()
    assert cats and cats[0]["medicines"] > 0
    assert client.get(f"/categories/{cats[0]['name']}").json()["total"] > 0
    ing = client.get("/ingredients", params={"letter": "a"}).json()
    assert ing["items"] and all(i["name_en"][0].upper() == "A" for i in ing["items"])
    countries = client.get("/brands/countries").json()
    jordan = client.get("/brands", params={"country": "Jordan"}).json()
    assert any(c["country"] == "Jordan" for c in countries)
    assert all("Jordan" in b["countries"] for b in jordan["items"])


def test_account_saved_and_chats(client):
    import uuid

    email = f"t{uuid.uuid4().hex[:8]}@example.com"
    bad = client.post("/auth/register", json={"name": "T", "email": "nope", "password": "short"})
    assert bad.status_code == 422
    reg = client.post("/auth/register", json={"name": "Test", "email": email, "password": "longenough1"}).json()
    headers = {"Authorization": f"Bearer {reg['token']}"}
    assert client.get("/auth/me", headers=headers).json()["email"] == email
    assert client.post("/auth/login", json={"email": email, "password": "wrong-pass"}).status_code == 401
    login = client.post("/auth/login", json={"email": email, "password": "longenough1"}).json()
    headers = {"Authorization": f"Bearer {login['token']}"}

    med = client.get("/medicines/search", params={"q": "abizol"}).json()["results"][0]
    assert client.put(f"/me/saved/{med['id']}", headers=headers).json()["saved"]
    assert [m["id"] for m in client.get("/me/saved", headers=headers).json()] == [med["id"]]
    client.delete(f"/me/saved/{med['id']}", headers=headers)
    assert client.get("/me/saved", headers=headers).json() == []
    assert client.get("/me/saved").status_code == 401

    # Safety words always give the fixed safety reply, with or without the AI connected
    ans = client.post("/assistant/ask", json={"question": "I took 10 tablets today", "medicine_id": med["id"]}, headers=headers).json()
    assert ans["kind"] == "safety"
    chats = client.get("/me/chats", headers=headers).json()
    assert chats and chats[0]["id"] == ans["chat_id"]
    full = client.get(f"/me/chats/{ans['chat_id']}", headers=headers).json()
    assert [m["role"] for m in full["messages"]] == ["user", "assistant"]

    client.post("/auth/logout", headers=headers)
    assert client.get("/auth/me", headers=headers).status_code == 401


def test_conditions(client):
    conds = client.get("/conditions").json()
    assert conds and all(c["medicines"] > 0 for c in conds)
    assert client.get(f"/conditions/{conds[0]['slug']}").json()["total"] > 0


class _FakeClient:
    """Stands in for the Anthropic client so tests never call the real API."""

    def __init__(self, reply):
        self.reply = reply
        self.messages = self

    def create(self, **kwargs):
        self.last = kwargs
        block = type("Block", (), {"type": "text", "text": self.reply})()
        return type("Response", (), {"content": [block]})()


def test_assistant_answer_and_no_info(client, monkeypatch):
    from app.routes import assistant

    med = client.get("/medicines/search", params={"q": "abizol"}).json()["results"][0]

    fake = _FakeClient(f"Abizol is made by Nobel.\nSOURCES: {med['id']}")
    monkeypatch.setattr(assistant, "_client", lambda: fake)
    ans = client.post("/assistant/ask", json={"question": "Who makes it?", "medicine_id": med["id"]}).json()
    assert ans["kind"] == "answer" and ans["text"] == "Abizol is made by Nobel."
    assert ans["sources"][0]["medicine_id"] == med["id"]
    assert "Abizol" in fake.last["messages"][0]["content"]

    monkeypatch.setattr(assistant, "_client", lambda: _FakeClient("NO_VERIFIED_INFO"))
    assert client.post("/assistant/ask", json={"question": "Is it good for migraines?", "medicine_id": med["id"]}).json()["kind"] == "no_info"

    monkeypatch.setattr(assistant, "_client", lambda: None)
    assert client.post("/assistant/ask", json={"question": "Who makes it?", "medicine_id": med["id"]}).json()["kind"] == "no_info"
