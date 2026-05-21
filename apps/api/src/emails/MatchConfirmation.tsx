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
  tutorName: string;
  tuteeName: string;
  tuteeGradeLevel?: number | null;
  subject: string;
  acceptLink: string;
  declineLink: string;
  adminEmail: string;
};

export function MatchConfirmationTutor({
  tutorName,
  tuteeName,
  tuteeGradeLevel,
  subject,
  acceptLink,
  declineLink,
  adminEmail: _adminEmail,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>You've been matched for tutoring — {subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Academy Tutoring — New Match</Text>
          <Text style={text}>Hi {tutorName},</Text>
          <Text style={text}>
            You've been matched to tutor <strong>{tuteeName}</strong>
            {tuteeGradeLevel != null && (
              <>
                {" "}
                (Grade {tuteeGradeLevel})
              </>
            )}{" "}
            in <strong>{subject}</strong>. Please accept or decline below.
          </Text>
          <Button href={acceptLink} style={acceptButton}>
            Accept
          </Button>{" "}
          <Button href={declineLink} style={declineButton}>
            Decline
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from AOSM Tutoring. Please contact
            your program leadership with questions.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

type TuteeProps = {
  tuteeName: string;
  tutorName: string;
  subject: string;
  adminEmail: string;
};

export function MatchConfirmationTutee({
  tuteeName,
  tutorName,
  subject,
  adminEmail: _adminEmail,
}: TuteeProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been matched with a tutor for {subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Academy Tutoring — You've Been Matched!</Text>
          <Text style={text}>Hi {tuteeName},</Text>
          <Text style={text}>
            Great news — you've been matched with <strong>{tutorName}</strong>{" "}
            for <strong>{subject}</strong>. They'll confirm the session time
            shortly. Keep an eye on your email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from AOSM Tutoring. Please contact
            your program leadership with questions.
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
const acceptButton = { backgroundColor: "#16a34a", color: "#ffffff", padding: "12px 20px", borderRadius: "6px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block", marginRight: "8px" };
const declineButton = { backgroundColor: "#dc2626", color: "#ffffff", padding: "12px 20px", borderRadius: "6px", fontSize: "15px", fontWeight: "600", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
