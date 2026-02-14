import { Card, Button, Container, CardHeader, CardBody } from "react-bootstrap";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card className="shadow-sm p-4 w-100" style={{ maxWidth: "500px" }}>
        <CardHeader className="text-center bg-primary text-white">
          <h1 className="mb-0">TBR Lists</h1>
        </CardHeader>

        <CardBody className="text-center">
          <div className="mb-4">
            <h4>Create an account?</h4>
            <Link href="/signup">
              <Button className="w-100 mt-2 primary">
                Sign Up
              </Button>
            </Link>
          </div>

          <hr />

          <div>
            <h4>Already have an account?</h4>
             <Link href="/login" passHref>
              <Button className="w-100 mt-2 secondary">
                Log In
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
}
