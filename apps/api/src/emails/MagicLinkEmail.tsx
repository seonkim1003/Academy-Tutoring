import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

type Props = {
  adminName: string;
  magicLink: string;
};

export function MagicLinkEmail({ adminName, magicLink }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your Academy Tutoring admin login link</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Academy Tutoring — Admin Login</Text>
          <Text style={text}>Hi {adminName},</Text>
          <Text style={text}>
            Click the button below to log in to the admin dashboard. This link
            expires in 15 minutes.
          </Text>
          <Button href={magicLink} style={button}>
            Log in to Admin Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" };
const container = { maxWidth: "560px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "40px" };
const heading = { fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "24px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "24px" };
const button = { backgroundColor: "#2563eb", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
