"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Container, Spinner, Button, Card, CardTitle, Row, CardBody, CardText, CardFooter, Dropdown, DropdownButton, DropdownItem} from "react-bootstrap";
import '@/app/(protected)/reading-lists/[listId]/page.css';
import { formatDate } from '@/helpers/dateFormat';
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRouter } from "next/navigation";

export default function ReadingListDetailPage() {
  useAuthGuard();
  const router = useRouter();
  const params = useParams<{ listId: string }>();
  const listId = params.listId;
  const [list, setList] = useState<any>({ entries: [] }); // default entries to empty array
  const [loading, setLoading] = useState(true);

  const readingStatus = [
    { value: 'unread', label: 'Unread'},
    { value: 'reading', label: 'Reading'},
    { value: 'finished', label: 'Finished'}
  ]

  const [entryUpdates, setEntryUpdates] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchList = async () => {
      try {
        if (!listId) return;

        const res = await axios.get(`/api/reading-lists/${listId}`);
        const listFromRes = res.data?.list || { entries: [] };
        setList(listFromRes);

        const initialEdits: Record<string, any> = {};
        (listFromRes.entries || []).forEach((entry: any) => {
          initialEdits[entry._id] = {
            status: entry.status,
            date_started: entry.date_started ? entry.date_started.slice(0, 10) : "",
            date_finished: entry.date_finished ? entry.date_finished.slice(0, 10) : "",
            reading_notes: entry.reading_notes || ""
          };
        });
        setEntryUpdates(initialEdits);
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

    fetchList();
  }, [listId, router]);

  const updateBook = async (entryId: string) => {
  try {
    const payload = entryUpdates[entryId];

    const res = await axios.patch(
      "/api/reading-lists/update-book",
      {
        entryId,
        ...payload,
      }
    );

    setList((prev: any) => ({
      ...prev,
      entries: prev.entries.map((entry: any) =>
        entry._id === entryId ? res.data.entry : entry
      ),
    }));
  } catch (err) {
    console.error("Failed to update book", err);
  }
};


  const removeBook = async (entryId: string) => {
   try {
    await axios.post("/api/reading-lists/remove-book", { listId, entryId });
    setList((prev: any) => {
      const updatedEntries = prev.entries.filter((entry: any) => entry._id !== entryId)
      return { ...prev, entries: updatedEntries };
    });
   } catch (err) {
    console.log("Failed to remove book", err)
   }
  };

  if (loading) return <Container className="mt-5"><Spinner /></Container>;
  if (!list) return <Container>List not found</Container>;

  return (
    <Container className="mt-5">
      <Button href="/reading-lists" className="mb-3">
        ← Back to Lists
      </Button>

      <h2>{list.name}</h2>
      {list.description && <p>{list.description}</p>}

      {list.entries.length > 0 ? (
        <Row>
          {list.entries.map((entry: any) => {
            const book = entry.book_id;
            if (!book) return null;

            return (
              <Card className="reading-list-card-item p-2" key={entry._id}>
                <div className="m-3">
                  <img src={book.thumbnail} className="card-img-size" alt={book.title} />
                </div>
                <CardBody>
                  <CardTitle><h3>{book.title}</h3></CardTitle>
                  {book.authors?.length > 0 && (
                    <CardText><strong>Author(s):</strong> {book.authors.join(", ")}</CardText>
                  )}
                  <DropdownButton id="dropdown-basic-button" 
                    title={
                      readingStatus.find(
                        s => s.value === entryUpdates[entry._id]?.status
                      )?.label || "Select Book Status"
                    } size="sm" variant="secondary">
                    {readingStatus.map((status) => (
                      <DropdownItem 
                        key={status.value}
                        active={entryUpdates[entry._id]?.status === status.value}
                        onClick={() => 
                          setEntryUpdates((prev) => ({
                            ...prev,
                            [entry._id]: {
                              ...prev[entry._id],
                              status: status.value,
                            },
                          }))
                        }>{status.label}</DropdownItem>
                    ))}
                  </DropdownButton>
                  <CardText><strong>Date Added: </strong>{formatDate(entry.date_added)}</CardText>
                  <CardText>
                    <label>Date Stared:</label>
                    <input type="date"
                      value={entryUpdates[entry._id]?.date_started || ""}
                      onChange={(e) => 
                        setEntryUpdates((prev) => ({
                          ...prev,
                          [entry._id]: {
                            ...prev[entry._id],
                            date_started: e.target.value
                          }
                        }))
                      }/>
                  </CardText>
                  <CardText>
                    <label>Date Finished:</label>
                    <input type="date"
                      value={entryUpdates[entry._id]?.date_finished || ""}
                      onChange={(e) => 
                        setEntryUpdates((prev) => ({
                          ...prev,
                          [entry._id]: {
                            ...prev[entry._id],
                            date_finished: e.target.value
                          }
                        }))
                      }/>
                  </CardText>
                   <CardText>
                    <label>Notes:</label>
                    <textarea
                      value={entryUpdates[entry._id]?.reading_notes || ""}
                      onChange={(e) => 
                        setEntryUpdates((prev) => ({
                          ...prev,
                          [entry._id]: {
                            ...prev[entry._id],
                            reading_notes: e.target.value
                          }
                        }))
                      }/>
                  </CardText>
                  {book.page_count && <CardText><strong>Page Count:</strong> {book.page_count}</CardText>}
                  {book.publication_date && <CardText><strong>Publication Date:</strong> {book.publication_date}</CardText>}
                  {book.description && <CardText><strong>Description:</strong> {book.description}</CardText>}
                </CardBody>
                <CardFooter className="d-flex justify-content-between">
                  <Button size="sm" className="btn btn-primary btn-sm update-btn" onClick={() => updateBook(entry._id)}>
                    Update Book
                  </Button>
                  <Button size="sm" className="btn btn-secondary btn-sm remove-btn"  onClick={() => removeBook(entry._id)}>
                    Remove Book
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </Row>
      ) : (
        <p className="text-muted">No books in this list yet.</p>
      )}
    </Container>
  );
}
