"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Row, Col, Spinner } from "react-bootstrap";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/navigation";

export default function ReadingListsPage() {
  useAuthGuard();
  const router = useRouter();
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await axios.get("/api/reading-lists/user");
        setLists(res.data.lists || []);
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
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [router]);

  if (loading) {
    return (
      <Container className="mt-5">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Your Reading Lists</h2>

      <Button className="mb-3" href="/dashboard">
        ← Back to Dashboard
      </Button>

      <Row>
        {lists.map((list) => (
          <Col md={4} key={list._id}>
            <Card className="p-3 mb-3 shadow-sm">
              <h5>{list.name}</h5>
              <p>{list.entries?.length} books</p>
              {list.description && (
                <p>{list.description}</p>
              )}

              <Button href={`/reading-lists/${list._id}`}>
                View Details
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
