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
