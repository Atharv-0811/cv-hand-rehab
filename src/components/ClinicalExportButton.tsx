'use client';

import React from 'react';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ClinicalExportButton() {
  const handleExport = () => {
    // Instantiate jsPDF on the client side inside the event handler
    // to keep it isolated from SSR and main render loops.
    const doc = new jsPDF();

    // Document Title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40); // Dark gray, professional look
    doc.text('Clinical Session Report', 14, 22);

    // Document Subtitle / Metadata
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

    // Mock Data for the table
    const mockData = [
      ['2026-05-08', 'Wrist Extension', '0.85', '92%'],
      ['2026-05-07', 'Finger Abduction', '0.78', '88%'],
      ['2026-05-06', 'Wrist Extension', '0.81', '90%'],
      ['2026-05-05', 'Thumb Flexion', '0.90', '95%'],
      ['2026-05-04', 'Wrist Flexion', '0.82', '89%'],
      ['2026-05-03', 'Finger Abduction', '0.75', '85%'],
    ];

    // Generate Table
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Exercise Name', 'Max Extension Ratio', 'Accuracy %']],
      body: mockData,
      theme: 'grid',
      headStyles: { 
        fillColor: [40, 40, 40], // Matches the carbonBlack theme conceptually
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250], // Very light gray to avoid harsh contrasts
      }
    });

    // Download PDF
    doc.save('clinical-session-report.pdf');
  };

  return (
    <Button
      variant="outline"
      color="carbonBlack"
      radius="md"
      leftSection={<IconDownload size={16} />}
      onClick={handleExport}
    >
      Export Clinical Report
    </Button>
  );
}
