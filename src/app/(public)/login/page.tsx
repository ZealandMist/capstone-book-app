"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Form, Button, Card, Container, Spinner, Row } from "react-bootstrap";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [validated, setValidated] = useState(false);

  const { login } = useAuth();


  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setFieldErrors({});
  };
 
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setValidated(true);
    setLoading(true);
    setError(null);
    setFieldErrors({})

    try {
      await axios.post("/api/auth/login", form);
      const res = await axios.get("/api/auth/profile");
      login(res.data);
      router.replace("/dashboard")
    } catch (err: any) {
      console.log(err.response?.data?.message || "Login failed");
      
      const message = err.response?.data?.message || "Login failed";

    if (message.toLowerCase().includes("email")) {
      setFieldErrors({ email: message });
    } else if (message.toLowerCase().includes("password")) {
      setFieldErrors({ password: message });
    } else {
      setError(message);
    }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="shadow-sm p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Log In</Card.Title>
          {error && (
            <div className="alert alert-danger text-center py-2">
              {error}
            </div>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                isInvalid={!!fieldErrors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                isInvalid={!!fieldErrors.password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </div>
          </Form>

          <Row className="mt-3">
            <p>Create an account?{" "} <Link href="/signup">Sign Up</Link></p>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}
