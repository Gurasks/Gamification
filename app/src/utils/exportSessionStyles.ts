export const getEnhancedStyles = () => `
  <style>
    /* Estilos Gerais */
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 20px;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
    }

    .report-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    /* Cabeçalho */
    .report-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }

    .report-header h1 {
      color: #1e40af;
      font-size: 32px;
      margin-bottom: 20px;
    }

    .header-info {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      text-align: left;
      margin-top: 20px;
    }

    .info-row {
      margin-bottom: 8px;
      padding: 5px 0;
    }

    .info-row strong {
      min-width: 160px;
      display: inline-block;
      color: #374151;
    }

    /* Sumário Executivo */
    .executive-summary {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 25px;
      border-radius: 10px;
      margin-bottom: 40px;
      border-left: 5px solid #0ea5e9;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .summary-card h3 {
      color: #374151;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }

    .summary-card ol, .summary-card ul {
      padding-left: 20px;
    }

    .summary-card li {
      margin-bottom: 8px;
      padding: 5px 0;
    }

    /* Tabelas */
    .section {
      margin-bottom: 50px;
      page-break-inside: avoid;
    }

    .section h2 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #dbeafe;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    th {
      background: linear-gradient(to right, #3b82f6, #1d4ed8);
      color: white;
      font-weight: 600;
      padding: 15px;
      text-align: left;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    tr:hover {
      background-color: #f8fafc;
    }

    .top-three {
      background-color: #fef3c7 !important;
    }

    .rank {
      font-weight: bold;
      color: #374151;
      text-align: center;
      min-width: 60px;
    }

    .score {
      font-weight: bold;
      color: #059669;
      text-align: center;
    }

    .rating {
      color: #d97706;
      text-align: center;
    }

    /* Cards de Sugestões */
    .cards-analysis {
      margin-top: 20px;
    }

    .card-detail {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      page-break-inside: avoid;
    }

    .card-detail:nth-child(odd) {
      background: #f8fafc;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .card-text {
      font-size: 16px;
      line-height: 1.6;
      color: #374151;
      margin-bottom: 15px;
    }

    .card-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f1f5f9;
      border-radius: 6px;
    }

    /* Metadados */
    .metadata-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 15px 0;
      padding: 10px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .metadata-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      margin-right: 8px;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .priority-baixa { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .priority-media { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .priority-alta { background: #fecaca; color: #991b1b; border: 1px solid #fca5a5; }
    .priority-critica { background: #f5d0fe; color: #86198f; border: 1px solid #e9d5ff; }
    .requirement-funcional { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .requirement-design {background: #fdf2f8 !important; color: #831843 !important; border: 1px solid #fbcfe8 !important;}
    .requirement-nao-funcional { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
    .requirement-tecnico { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .category-bug { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .category-feature { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .category-melhoria { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .effort { background: #f3e8ff; color: #7c3aed; border: 1px solid #e9d5ff; }
    .votes { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

    /* Comentários */
    .comments-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .comment {
      margin-bottom: 15px;
      padding: 15px;
      background: white;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .comment-date {
      color: #6b7280;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .comment-text {
      color: #374151;
      line-height: 1.5;
      margin-top: 8px;
    }

    /* Distribuição de Metadados */
    .distribution-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .distribution-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-top: 4px solid #3b82f6;
    }

    .distribution-card h3 {
      color: #374151;
      margin-bottom: 15px;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .distribution-card ul {
      padding-left: 20px;
    }

    .distribution-card li {
      margin-bottom: 8px;
      padding: 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Gamificação */
    .gamification-section {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
      border: 1px solid #bbf7d0;
    }

    .gamification-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .gamification-item {
      padding: 10px;
      background: white;
      border-radius: 6px;
      font-size: 13px;
      border: 1px solid #d1fae5;
    }

    .gamification-item strong {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      color: #374151;
    }

    /* Footer */
    .report-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .footer-note {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 5px;
    }

    /* Impressão */
    @media print {
      body {
        margin: 0;
        background: white;
        font-size: 12px;
      }
      .report-container {
        padding: 15px;
        box-shadow: none;
      }
      .section {
        page-break-inside: avoid;
        margin-bottom: 30px;
      }
      table {
        page-break-inside: avoid;
        font-size: 11px;
      }
      .card-detail {
        page-break-inside: avoid;
        padding: 10px;
        margin-bottom: 15px;
      }
      h1 { font-size: 24px; }
      h2 { font-size: 18px; }
      h3 { font-size: 16px; }
      .metadata-badge {
        font-size: 11px;
        padding: 4px 10px;
      }
    }

    /* Estilos para ícones SVG */
    .icon-inline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      margin-right: 6px;
    }

    /* Ajuste para ícones em badges */
    .metadata-badge svg {
      margin-right: 4px;
    }

    /* Ícones em tabelas */
    table svg {
      vertical-align: middle;
      margin-right: 4px;
    }

    /* Info rows com ícones */
    .info-row svg {
      margin-right: 8px;
      flex-shrink: 0;
    }

    /* Títulos com ícones */
    h1 svg, h2 svg, h3 svg {
      margin-right: 10px;
      vertical-align: middle;
    }
  </style>
`;
