"use client";

import { Navbar, Nav, Container, Button} from "react-bootstrap";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function AppNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand href="/dashboard">
         <Image src={'/assests/book-home-icon.png'} alt="Book List Logo" width={100} height={63} className="m-1 p-1"/>
           Reading Tracker
        </Navbar.Brand>

        {user && (
          <Nav className="ms-auto gap-3">
            <Nav.Link href="/profile">Profile</Nav.Link>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
}
