import { jsPDF } from 'jspdf';
import { Reservation, Event, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

export function generateTicketPDF(reservation: Reservation): void {
  const event = reservation.event as Event;
  const participant = reservation.participant as User;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(14, 165, 233); // primary-500
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(APP_NAME, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Confirmation de Réservation', pageWidth / 2, 32, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Event Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(event?.title || 'Événement', pageWidth / 2, 60, { align: 'center' });
  
  // Event Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let y = 80;
  const lineHeight = 10;
  const leftMargin = 30;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Détails de l\'événement', leftMargin, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  if (event) {
    doc.text(`Date: ${formatDate(event.date, 'EEEE dd MMMM yyyy')}`, leftMargin, y);
    y += lineHeight;
    
    doc.text(`Heure: ${event.time}`, leftMargin, y);
    y += lineHeight;
    
    doc.text(`Lieu: ${event.location}`, leftMargin, y);
    y += lineHeight;
    
    doc.text(`Catégorie: ${event.category}`, leftMargin, y);
    y += lineHeight * 2;
  }
  
  // Participant Info
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du participant', leftMargin, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  if (participant) {
    doc.text(`Nom: ${participant.name}`, leftMargin, y);
    y += lineHeight;
    
    doc.text(`Email: ${participant.email}`, leftMargin, y);
    y += lineHeight * 2;
  }
  
  // Reservation Info
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de réservation', leftMargin, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Numéro de réservation: ${reservation.id || reservation._id}`, leftMargin, y);
  y += lineHeight;
  
  doc.text(`Date de réservation: ${formatDate(reservation.createdAt, 'dd/MM/yyyy à HH:mm')}`, leftMargin, y);
  y += lineHeight;
  
  doc.text(`Statut: Confirmée`, leftMargin, y);
  y += lineHeight * 2;
  
  // Notes
  if (reservation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', leftMargin, y);
    y += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text(reservation.notes, leftMargin, y);
    y += lineHeight * 2;
  }
  
  // Footer
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(0, 260, pageWidth, 30, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text('Ce ticket fait office de confirmation. Veuillez le présenter lors de l\'événement.', pageWidth / 2, 272, { align: 'center' });
  doc.text(`Généré le ${formatDate(new Date().toISOString(), 'dd/MM/yyyy à HH:mm')}`, pageWidth / 2, 280, { align: 'center' });
  
  // Save
  const filename = `ticket-${event?.title?.replace(/\s+/g, '-').toLowerCase() || 'event'}-${reservation.id || reservation._id}.pdf`;
  doc.save(filename);
}
