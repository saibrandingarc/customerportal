export interface Invoice {
    Id: number;
    InvoiceDate: string;
    DueDate: string;
    TotalAmount: number;
    Status: "Paid" | "Pending";
}