import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';
import { ReservationDocument } from './schemas/reservation.schema';

@Injectable()
export class PdfService {
  generateTicketPdf(reservation: ReservationDocument, res: Response) {
    const doc = new PDFDocument({
      size: 'A5',
      margin: 50,
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket-${reservation.ticketNumber}.pdf`,
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    const event = reservation.event as unknown as {
      title: string;
      description: string;
      date: Date;
      location: string;
    };

    const participant = reservation.participant as unknown as {
      firstName: string;
      lastName: string;
      email: string;
    };

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text('EVENTIFY', { align: 'center' });

    doc.moveDown(0.5);

    doc
      .fontSize(16)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Event Ticket', { align: 'center' });

    doc.moveDown(1);

    // Separator line
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(1);

    // Event title
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text(event.title, { align: 'center' });

    doc.moveDown(1);

    // Event details
    doc.fontSize(12).font('Helvetica').fillColor('#475569');

    // Date
    doc
      .font('Helvetica-Bold')
      .text('Date: ', { continued: true })
      .font('Helvetica')
      .text(
        new Date(event.date).toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      );

    doc.moveDown(0.5);

    // Location
    doc
      .font('Helvetica-Bold')
      .text('Location: ', { continued: true })
      .font('Helvetica')
      .text(event.location);

    doc.moveDown(1);

    // Separator line
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(1);

    // Participant details
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Attendee');

    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica').fillColor('#475569');

    doc
      .font('Helvetica-Bold')
      .text('Name: ', { continued: true })
      .font('Helvetica')
      .text(`${participant.firstName} ${participant.lastName}`);

    doc.moveDown(0.3);

    doc
      .font('Helvetica-Bold')
      .text('Email: ', { continued: true })
      .font('Helvetica')
      .text(participant.email);

    doc.moveDown(1);

    // Separator line
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(1);

    // Ticket number
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text(`Ticket #: ${reservation.ticketNumber}`, { align: 'center' });

    doc.moveDown(1);

    // Status badge
    const statusX = (doc.page.width - 100) / 2;
    doc.roundedRect(statusX, doc.y, 100, 25, 5).fillAndStroke('#22c55e', '#22c55e');

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#ffffff')
      .text('CONFIRMED', statusX, doc.y - 18, {
        width: 100,
        align: 'center',
      });

    doc.moveDown(2);

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Please present this ticket at the event entrance.', {
        align: 'center',
      });

    doc.moveDown(0.3);

    doc.text(`Generated on ${new Date().toLocaleString()}`, {
      align: 'center',
    });

    // Finalize the PDF
    doc.end();
  }
}
