import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

type TutorProps = {
  tutorName: string;
  tuteeName: string;
  tuteeGradeLevel?: number | null;
  tuteeEmail: string;
  subject: string;
};

export function MatchAcceptedTutor({
  tutorName,
  tuteeName,
  tuteeGradeLevel,
  tuteeEmail,
  subject,
}: TutorProps) {
  return (
    <Html>
      <Head />
      <Preview>Match confirmed — {subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Academy Tutoring — Match Confirmed</Text>
          <Text style={text}>Hi {tutorName},</Text>
          <Text style={text}>
            Thanks for accepting your tutoring match for <strong>{subject}</strong>.
            Here is your tutee&apos;s contact information:
          </Text>
          <Text style={infoBlock}>
            <strong>Name:</strong> {tuteeName}
            <br />
            {tuteeGradeLevel != null && (
              <>
                <strong>Grade:</strong> {tuteeGradeLevel}
                <br />
              </>
            )}
            <strong>Email:</strong> {tuteeEmail}
          </Text>
          <Text style={text}>
            Please reach out to coordinate your first session.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from AOSM Tutoring.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

type TuteeProps = {
  tuteeName: string;
  tutorName: string;
  tutorGradeLevel?: number | null;
  tutorEmail: string;
  tutorPhone?: string | null;
  subject: string;
};

export function MatchAcceptedTutee({
  tuteeName,
  tutorName,
  tutorGradeLevel,
  tutorEmail,
  tutorPhone,
  subject,
}: TuteeProps) {
  return (
    <Html>
      <Head />
      <Preview>You have a tutor for {subject}!</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Academy Tutoring — You Have a Tutor!</Text>
          <Text style={text}>Hi {tuteeName},</Text>
          <Text style={text}>
            Great news — <strong>{tutorName}</strong> has confirmed as your tutor
            for <strong>{subject}</strong>. Here is how to reach them:
          </Text>
          <Text style={infoBlock}>
            <strong>Name:</strong> {tutorName}
            <br />
            {tutorGradeLevel != null && (
              <>
                <strong>Grade:</strong> {tutorGradeLevel}
                <br />
              </>
            )}
            <strong>Email:</strong> {tutorEmail}
            {tutorPhone && (
              <>
                <br />
                <strong>Phone:</strong> {tutorPhone}
              </>
            )}
          </Text>
          <Text style={text}>
            Your tutor will reach out to coordinate your first session. You can
            also email them directly using the address above.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from AOSM Tutoring.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#f9fafb", fontFamily: "system-ui, sans-serif" };
const container = {
  maxWidth: "560px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "40px",
};
const heading = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#111827",
  marginBottom: "24px",
};
const text = { fontSize: "15px", color: "#374151", lineHeight: "24px" };
const infoBlock = {
  fontSize: "15px",
  color: "#374151",
  lineHeight: "26px",
  backgroundColor: "#f3f4f6",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};
const hr = { borderColor: "#e5e7eb", margin: "32px 0" };
const footer = { fontSize: "13px", color: "#9ca3af" };
