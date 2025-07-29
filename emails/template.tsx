import { Body, Container, Head, Html, Preview, Text, Heading, Section } from "@react-email/components";
import * as React from "react";

const styles = {
    container: {
        backgroundColor: "#f9f9f9",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    heading: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    text: {
        fontSize: "18px",
        marginBottom: "20px",
    },
    section: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
    },
    label: {
        fontSize: "16px",
        fontWeight: "bold",
    },
    value: {
        fontSize: "16px",
        fontWeight: "bold",
    },
} as const;

// Define proper TypeScript interfaces
interface EmailData {
    usedPercentage: number;
    budgetAmount: number;
    totalExpenses: number;
}

interface EmailProps {
    userName?: string;
    type?: string;
    data?: EmailData;
}

export default function EmailTemplate({
    userName = "",
    type = "budget-alert",
    data = { usedPercentage: 0, budgetAmount: 0, totalExpenses: 0 }
}: EmailProps) {
    const remaining = data.budgetAmount - data.totalExpenses;

    return (
        <Html>
            <Head />
            <Preview>Budget Alert</Preview>
            <Body>
                <Container style={styles.container}>
                    <Heading style={styles.heading}>Budget Alert</Heading>
                    <Text style={styles.text}>
                        Hi {userName},<br />
                        This is a reminder that you have reached{" "}
                        {data.usedPercentage.toFixed(1)}% of your budget for this month.
                    </Text>
                    <Section style={styles.section}>
                        <div style={styles.row}>
                            <Text style={styles.label}>Budget Amount</Text>
                            <Text style={styles.value}>${data.budgetAmount}</Text>
                        </div>
                        <div style={styles.row}>
                            <Text style={styles.label}>Spent So Far</Text>
                            <Text style={styles.value}>${data.totalExpenses}</Text>
                        </div>
                        <div style={styles.row}>
                            <Text style={styles.label}>Remaining</Text>
                            <Text style={styles.value}>${remaining}</Text>
                        </div>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}