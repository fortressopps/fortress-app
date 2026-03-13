import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatBRL } from './format';

/**
 * Generates a PDF report for transactions.
 * Uses a hidden HTML template for rendering then captures it.
 */
export const generatePDF = async (data) => {
  const { month, transactions, summary } = data;
  
  // Create a temporary container for the report
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#fff';
  container.style.color = '#000';
  container.style.padding = '40px';
  container.style.fontFamily = 'Helvetica, sans-serif';

  const html = `
    <div style="border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h1 style="margin: 0; color: #10b981; font-size: 28px;">FORTRESS</h1>
        <p style="margin: 5px 0 0 0; color: #666;">Relatório Mensal de Transações</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-weight: bold;">Competência: ${month}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #dcfce7;">
        <p style="margin: 0; font-size: 12px; color: #166534; text-transform: uppercase;">Receitas</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #15803d;">${formatBRL(summary.totalIncome)}</p>
      </div>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fee2e2;">
        <p style="margin: 0; font-size: 12px; color: #991b1b; text-transform: uppercase;">Despesas</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #b91c1c;">${formatBRL(summary.totalExpenses)}</p>
      </div>
      <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #dbeafe;">
        <p style="margin: 0; font-size: 12px; color: #1e40af; text-transform: uppercase;">Saldo</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #1d4ed8;">${formatBRL(summary.balance)}</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b;">DATA</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b;">DESCRIÇÃO</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #64748b;">CATEGORIA</th>
          <th style="padding: 12px; text-align: right; font-size: 12px; color: #64748b;">VALOR</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(tx => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 12px; font-size: 13px;">${new Date(tx.date).toLocaleDateString('pt-BR')}</td>
            <td style="padding: 10px 12px; font-size: 13px;">${tx.description}</td>
            <td style="padding: 10px 12px; font-size: 13px;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${tx.category}</span></td>
            <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: bold; color: ${tx.amount < 0 ? '#ef4444' : '#22c55e'}">
              ${formatBRL(tx.amount)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; font-size: 10px; color: #999;">
      Fortress Intelligence © ${new Date().getFullYear()} — Todos os direitos reservados.
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Fortress_Report_${month}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};
