"use client";

import { useEffect, useState } from "react";
import { Form, Button, Card, Container, Spinner } from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
  const load = async () => {
    try {
      const res = await axios.get("/api/auth/profile");
      setForm({ ...form, ...res.data, password: "" });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.replace("/login"); // redirect to login if not authenticated
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put("/api/auth/profile", form);
      setIsSuccess(true);
      console.log("Profile was updated");
    } catch {
      console.log("Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <Container className="d-flex justify-content-center align-items-center mt5">
      <Card className="shadow-sm p-4" style={{ width: "100%", maxWidth: "450px" }}>
        <h2 className="mb-3"> Your Profile</h2>
        {isSuccess && (
          <p className="border border-2 border-success text-success p-2">Your profile has been updated successfully.</p>
        )}
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" value={form.username} onChange={handleChange} required/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control name="email" type="email" value={form.email} onChange={handleChange} required/>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password (Optional)</Form.Label>
            <Form.Control name="password" type="password" onChange={handleChange} />
          </Form.Group>

          <Button type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
 }