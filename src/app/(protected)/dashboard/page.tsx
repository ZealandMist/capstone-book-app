"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  FormSelect,
  Spinner,
  Modal,
  Form,
  FormControl,
  CardImg
} from "react-bootstrap";
import '@/app/(protected)/dashboard/page.css';
import { useRouter } from "next/navigation";

interface ReadingList {
  _id: string;
  name: string;
}

interface User {
  username: string;
}

export default function DashboardPage() {
  const { isAuth, loading, user } = useAuth();
  const router = useRouter();

  const [lists, setLists] = useState<ReadingList[]>([]);
  const [selectedList, setSelectedList] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearchState, setSearchState] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");

  // Fetch reading lists
  const fetchLists = async () => {
    try {
      const res = await axios.get("/api/reading-lists/user");
      setLists(res.data.lists || []);
      if (res.data.lists?.length) {
        setSelectedList(res.data.lists[0]._id);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          router.replace("/login");
        } else {
          console.error("Error fetching lists:", err.response?.data || err.message);
        }
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  useEffect(() => {
  if (!loading && !isAuth) {
      router.replace("/login");
    }

    fetchLists();
  }, [loading, isAuth]);

  if (!useAuth) {
    return null;
  }

  // Search books
  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoadingSearch(true);
    setSearchState(true);
    try {
      const res = await axios.get(
        `/api/books/search?q=${encodeURIComponent(searchTerm)}`
      );
      setResults(res.data.items || []);
    } catch (err) {
      console.error("Search failed", err);
      alert("Search failed. Try again later.");
    } finally {
      setLoadingSearch(false);
    }
  };


  // Add book to list
 const addBook = async (book: any) => {
  if (!selectedList) { alert("Please select a reading list first!"); return; }

  try {
    const res = await axios.post("/api/reading-lists/add-book", {
      list_id: selectedList,
      book, // pass full book object (server uses book.id and volumeInfo)
    });

    if (res.status === 200) {
      const listName = lists.find((l) => l._id === selectedList)?.name || "";
      setResults((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, added: true, addToList: listName } : b
        )
      );
    } else {
      alert(res.data.message || "Failed to add book.");
    }
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to add book.");
  }
};

  // Create list
  const createList = async () => {
    if (!newListName.trim()) return;

    try {
      await axios.post("/api/reading-lists/create", { name: newListName, description: newListDescription });
      setShowModal(false);
      setNewListName("");
      setNewListDescription("");
      fetchLists();
    } catch (err) {
      console.error("Create list failed", err);
    }
  };

  return (
    <Container className="mt-5">
      <h2>{user ? `${user.username}'s Dashboard` : "Your Dashboard"}</h2>

      {/* Reading Lists */}
      <h4 className="mt-4">{user ? `${user.username}'s Reading Lists` : "Your Reading Lists"}</h4>

      {lists.length === 0 ? (
        <p>No lists yet.</p>
      ) : (
        <FormSelect
          className="mb-3"
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          {lists.map((list) => (
            <option key={list._id} value={list._id}>
              {list.name}
            </option>
          ))}
        </FormSelect>
      )}

      <div className="d-flex gap-3">
      <Button onClick={() => setShowModal(true)}>Create a Reading List</Button>

      <Button variant="secondary" href="/reading-lists">View Reading Lists</Button>
      </div>

      {/* Search */}
      <h4 className="mt-4">Search Books</h4>
      <Form onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
        if(results.length === 0) {<p>No results found.</p>}
      }}>
        <Row className="mb-3">
          <Col md={6}>
            <FormControl
              placeholder="Search Google Books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col>
            <Button type="submit" disabled={loadingSearch || !searchTerm.trim}>{loadingSearch ? "Searching..." : "Search"}</Button>
          </Col>
        </Row>
      </Form>

      {loadingSearch && <Spinner />}

      {/* Results */}
      {hasSearchState && !loadingSearch && results.length === 0 && ( <p>No results found.</p>)}
      <Row>
        {results.map((book) => (
          <Col md={4} key={book.id} className="mb-3">
            <Card
              className={`p-3 shadow-sm ${book.added ? "opacity-50" : ""}`}
              style={{
                cursor: !selectedList || book.added ? "not-allowed" : "pointer"
              }}
              onClick={() => !book.added && addBook(book)}
            >
              {book.volumeInfo.imageLinks?.smallThumbnail && (
                <CardImg
                  src={book.volumeInfo.imageLinks.smallThumbnail}
                  className="mb-2 card-img-size"
                />
              )}
              <h5>{book.volumeInfo.title}</h5>
              <p><strong>Author(s)</strong>{book.volumeInfo.authors?.join(", ")}</p>
              {book.added ? (
                <small className="text-success fw-bold">✔ Book added to {book.addToList}</small>
                ) : (
                <small>Click to add to selected list</small>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create List Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Reading List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormControl
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="my-3"
          />
          <FormControl
            placeholder="List description"
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
            className="my-3"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={createList}>Create</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
