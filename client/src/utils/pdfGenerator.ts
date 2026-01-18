import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Order, OrderItem } from '../types';

// Type assertion for jsPDF with autoTable
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => void;
};

interface InvoiceData {
  order: Order;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    gstin?: string;
  };
}

export const generateInvoicePDF = (invoiceData: InvoiceData): void => {
  const { order, customerInfo, companyInfo } = invoiceData;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = '#ed7a1a'; // Brand clay color
  const secondaryColor = '#3A2E24'; // Brand ink color
  const lightGray = '#f8f9fa';
  
  // Company Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyInfo.address} | ${companyInfo.phone} | ${companyInfo.email}`, 20, 26);
  
  // Invoice Title
  doc.setTextColor(secondaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 50);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${order.orderId}`, 150, 60);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 150, 66);
  doc.text(`Due Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 150, 72);
  
  // Customer Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customerInfo.name, 20, 100);
  doc.text(customerInfo.email, 20, 106);
  doc.text(customerInfo.phone, 20, 112);
  doc.text(`${customerInfo.address.street}`, 20, 118);
  doc.text(`${customerInfo.address.city}, ${customerInfo.address.state} - ${customerInfo.address.pincode}`, 20, 124);
  
  // Shipping Address
  if (order.shippingAddress) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', 110, 90);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(order.shippingAddress.name, 110, 100);
    doc.text(order.shippingAddress.phone, 110, 106);
    doc.text(order.shippingAddress.street, 110, 112);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 110, 118);
  }
  
  // Items Table
  const tableData = order.items.map((item: OrderItem, index: number) => {
    // Get product name from productId (which can be string or Product object)
    const productName = typeof item.productId === 'string' 
      ? `Product ${item.productId}` 
      : item.productId.name || 'Unknown Product';
    
    return [
      index + 1,
      productName,
      item.quantity,
      `₹${item.price.toLocaleString('en-IN')}`,
      `₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    ];
  });
  
  (doc as jsPDFWithAutoTable).autoTable({
    startY: 140,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 }
    }
  });
  
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Order Summary
  const summaryData = [
    ['Subtotal:', `₹${order.pricing?.subtotal?.toLocaleString('en-IN') || '0'}`],
    ['Shipping:', `₹${order.pricing?.shipping?.toLocaleString('en-IN') || '0'}`],
    ['Tax:', `₹${order.pricing?.tax?.toLocaleString('en-IN') || '0'}`],
    ['Total:', `₹${order.pricing?.total?.toLocaleString('en-IN') || '0'}`]
  ];
  
  (doc as jsPDFWithAutoTable).autoTable({
    startY: finalY,
    body: summaryData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { halign: 'right', cellWidth: 120, fontStyle: 'bold' },
      1: { halign: 'right', cellWidth: 40, fontStyle: 'bold' }
    },
    bodyStyles: {
      fillColor: lightGray
    }
  });
  
  // Payment Information
  const paymentY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information:', 20, paymentY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${order.payment?.method || 'Razorpay'}`, 20, paymentY + 10);
  doc.text(`Transaction ID: ${order.payment?.transactionId || 'N/A'}`, 20, paymentY + 16);
  doc.text(`Status: ${order.payment?.status || 'Paid'}`, 20, paymentY + 22);
  doc.text(`Payment Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 20, paymentY + 28);
  
  // Order Status
  doc.text(`Order Status: ${order.status || 'Processing'}`, 110, paymentY + 10);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 110, paymentY + 16);
  
  // Footer
  const footerY = 270;
  doc.setFillColor(lightGray);
  doc.rect(0, footerY, 210, 30, 'F');
  
  doc.setTextColor(secondaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 20, footerY + 10);
  doc.text('For support, contact us at support@kalakari.shop', 20, footerY + 16);
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, footerY + 22);
  
  // GST Information (if applicable)
  if (companyInfo.gstin) {
    doc.text(`GSTIN: ${companyInfo.gstin}`, 150, footerY + 10);
  }
  
  // Save the PDF
  const fileName = `invoice_${order.orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateOrderConfirmationPDF = (invoiceData: InvoiceData): void => {
  const { order, customerInfo, companyInfo } = invoiceData;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = '#ed7a1a';
  const secondaryColor = '#3A2E24';
  
  // Header with success message
  doc.setFillColor('#10b981'); // Green color for success
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('✅ Order Confirmed!', 20, 18);
  
  // Company info
  doc.setFillColor(primaryColor);
  doc.rect(0, 25, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 20, 40);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyInfo.address} | ${companyInfo.phone}`, 20, 46);
  
  // Order details
  doc.setTextColor(secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order #${order.orderId}`, 20, 70);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 20, 80);
  doc.text(`Status: ${order.status || 'Processing'}`, 20, 86);
  doc.text(`Payment: ${order.payment?.status || 'Paid'}`, 20, 92);
  
  // Customer info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information:', 20, 110);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${customerInfo.name}`, 20, 120);
  doc.text(`Email: ${customerInfo.email}`, 20, 126);
  doc.text(`Phone: ${customerInfo.phone}`, 20, 132);
  
  // Items summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Order Summary:', 20, 150);
  
  const tableData = order.items.map((item: OrderItem, index: number) => {
    // Get product name from productId (which can be string or Product object)
    const productName = typeof item.productId === 'string' 
      ? `Product ${item.productId}` 
      : item.productId.name || 'Unknown Product';
    
    return [
      index + 1,
      productName,
      item.quantity,
      `₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    ];
  });
  
  (doc as jsPDFWithAutoTable).autoTable({
    startY: 160,
    head: [['#', 'Item', 'Qty', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: ₹${order.pricing?.total?.toLocaleString('en-IN') || '0'}`, 20, finalY);
  
  // Thank you message
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your order! We will process it shortly.', 20, finalY + 20);
  
  // Contact info
  doc.setFontSize(10);
  doc.text('For any queries, contact us at support@kalakari.shop', 20, finalY + 30);
  
  // Save the PDF
  const fileName = `order_confirmation_${order.orderId}.pdf`;
  doc.save(fileName);
};

// Utility function to download invoice for existing orders
export const downloadOrderInvoice = async (orderId: string): Promise<void> => {
  try {
    // Fetch order details
    const response = await fetch(`/api/orders/${orderId}`);
    const data = await response.json();
    
    if (data.success && data.data) {
      const order = data.data;
      
      // Create invoice data
      const invoiceData: InvoiceData = {
        order,
        customerInfo: {
          name: order.shippingAddress?.name || 'Customer',
          email: 'customer@example.com', // You might want to fetch this from user data
          phone: order.shippingAddress?.phone || '',
          address: {
            street: order.shippingAddress?.street || '',
            city: order.shippingAddress?.city || '',
            state: order.shippingAddress?.state || '',
            pincode: order.shippingAddress?.pincode || ''
          }
        },
        companyInfo: {
          name: 'Kalakari',
          address: '123 Artisan Street, Craft City, India',
          phone: '+91 9876543210',
          email: 'support@kalakari.shop',
          website: 'www.kalakari.shop',
          gstin: '29ABCDE1234F1Z5'
        }
      };
      
      generateInvoicePDF(invoiceData);
    } else {
      throw new Error('Failed to fetch order details');
    }
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};
