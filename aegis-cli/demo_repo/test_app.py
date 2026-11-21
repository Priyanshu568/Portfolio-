import sqlite3

import pytest

try:
    from demo_repo.app import get_user
except ImportError:
    from .app import get_user


@pytest.fixture
def setup_db():
    """Create an in-memory SQLite DB with test data."""
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)")
    conn.execute("INSERT INTO users (username) VALUES ('alice')")
    conn.execute("INSERT INTO users (username) VALUES ('bob')")
    conn.commit()
    yield conn
    conn.close()


def test_get_user_found(setup_db):
    result = get_user(setup_db, "alice")
    assert result is not None
    assert result[1] == "alice"


def test_get_user_not_found(setup_db):
    result = get_user(setup_db, "nobody")
    assert result is None


def test_get_user_type(setup_db):
    result = get_user(setup_db, "bob")
    assert isinstance(result, tuple)
