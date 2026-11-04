/* Conteúdo da Ajuda do Retornei (também vira o manual em PDF). Texto puro: a tela monta o visual. */
(function () {
  'use strict';
  // "quadros" ilustram o passo: lista de peças simples que a tela desenha
  // ['btn', texto] botão azul · ['in', rótulo, valor] campo · ['chips', [..], [ligados]] opções
  // ['zap', texto] balão do WhatsApp · ['linha', nome, situação] linha da fila · ['acoes', [..]] botões pequenos
  window.AJUDA_CONTEUDO = {
    topicos: [
      {
        id: 'primeiros', grupo: 'Começando', titulo: 'Primeiros passos',
        lead: 'O que fazer no primeiro dia para deixar o Retornei pronto para a loja.',
        passos: [
          ['Conecte o computador', 'Um administrador entra com e-mail e senha e dá um nome ao computador, como Balcão 01. Isso é feito uma vez em cada computador.', [['in', 'Nome do computador', 'Balcão 01']]],
          ['Cadastre a loja', 'Só no primeiro computador: nome da loja, WhatsApp e responsável. Os outros computadores já entram com tudo pronto.', [['in', 'Nome da loja', 'Viva Nature']]],
          ['Adicione a equipe', 'Em Equipe, no modo administrador, adicione cada vendedor. O nome do vendedor assina as mensagens do WhatsApp.', [['btn', 'Adicionar']]],
          ['Confira prazos e mensagens', 'Em Ajustes, veja em quantos dias o cliente volta para a fila e o texto que vai no WhatsApp.', [['chips', ['15 dias', '30 dias', '60 dias'], [0, 1]]]],
          ['Cadastre a primeira venda', 'Pronto. A partir daqui, cada venda cadastrada vira um lembrete na tela Hoje.', [['btn', 'Nova venda']]],
        ],
        dica: 'Aperte Ctrl+N em qualquer tela para abrir a Nova venda.',
      },
      {
        id: 'conectar', grupo: 'Começando', titulo: 'Conectar um computador',
        lead: 'Todos os computadores da loja veem os mesmos clientes e vendas. Cada um precisa ser conectado uma vez.',
        passos: [
          ['Instale o Retornei', 'Use o instalador da versão mais recente. Depois disso, as atualizações chegam sozinhas.', null],
          ['Entre com um administrador', 'Na tela Conectar computador, use o e-mail e a senha de um administrador.', [['in', 'E-mail', 'admin@loja.com']]],
          ['Dê um nome ao computador', 'Ex.: Balcão 01, Balcão 02, Caixa. O nome aparece no rodapé do menu.', [['in', 'Nome do computador', 'Balcão 02']]],
          ['Aguarde os dados', 'Em poucos segundos aparecem os clientes e vendas da loja. No rodapé do menu fica "Sincronizado".', null],
        ],
        dica: 'A senha não fica salva no computador. Depois de conectado, qualquer vendedor usa o Retornei sem senha.',
      },
      {
        id: 'venda', grupo: 'No dia a dia', titulo: 'Cadastrar uma venda',
        lead: 'Leva menos de um minuto. Com a venda cadastrada, o Retornei agenda sozinho quando chamar o cliente de novo.',
        passos: [
          ['Clique em Nova venda', 'Fica no canto de cima, à direita, em qualquer tela. Pelo teclado: Ctrl + N.', [['btn', 'Nova venda']]],
          ['Digite o celular do cliente', 'Se ele já comprou antes, o Retornei avisa que já é cliente. Se for novo, preencha o nome. Para empresas, escolha Atacado e informe o CNPJ.', [['in', 'Celular', '(82) 99999-0001'], ['in', 'Nome', 'Bia Souza']]],
          ['Informe a compra', 'Número do cupom, valor e data. A data já vem com hoje; mude só se a venda foi em outro dia.', [['chips', ['Cupom 1024', 'R$ 120,00'], []]]],
          ['Escolha quando chamar de novo', 'Os prazos da loja já vêm marcados. Dá para marcar mais de um: o cliente entra na fila em cada data.', [['chips', ['15 dias', '30 dias'], [0, 1]]]],
          ['Escolha o vendedor e salve', 'O nome do vendedor assina a mensagem do WhatsApp. O Retornei lembra o último vendedor usado neste computador.', [['in', 'Vendedor', 'Michele Ferreira'], ['btn', 'Salvar venda']]],
        ],
        dica: 'Errou algum dado? Abra o cliente em Clientes e clique no lápis ao lado da compra para editar.',
      },
      {
        id: 'fila', grupo: 'No dia a dia', titulo: 'Chamar os clientes do dia',
        lead: 'A tela Hoje mostra quem precisa ser chamado. Os atrasados aparecem primeiro.',
        passos: [
          ['Abra Hoje', 'O número ao lado de Hoje, no menu, mostra quantos clientes estão na fila.', [['linha', 'Bia Souza', 'Para hoje'], ['linha', 'Duda Reis', 'Atrasado 2 dias']]],
          ['Clique no cliente', 'Do lado direito aparecem a compra, o vendedor e a mensagem pronta.', null],
          ['Confira a mensagem', 'Dá para mudar o texto ali mesmo antes de enviar. A mudança vale só para esse cliente.', [['zap', 'Olá, Bia! Aqui é a Michele, da Viva Nature…']]],
          ['Clique em Enviar no WhatsApp', 'O WhatsApp abre com o texto escrito. Envie por lá. O cliente sai da fila e conta nos relatórios.', [['btn', 'Enviar no WhatsApp']]],
          ['Outras opções', 'Já falei: marca como feito sem abrir o WhatsApp. Amanhã: passa para o dia seguinte. Pular: deixa para o fim da fila de hoje.', [['acoes', ['Já falei', 'Amanhã', 'Pular']]]],
          ['Responda "Como foi?"', 'Comprou: abre a Nova venda já com o cliente. Não comprou: ele segue para o próximo retorno. Não respondeu: ele volta para a fila em 3 dias, uma vez. Responder é opcional. Chamou por engano? Clique em Desfazer, ao lado de "Feito hoje".', [['acoes', ['Comprou', 'Não comprou', 'Não respondeu']]]],
        ],
        dica: 'Use Semana e Mês, no alto da tela, para ver quem vai entrar na fila nos próximos dias.',
      },
      {
        id: 'mensagens', grupo: 'No dia a dia', titulo: 'Mensagens do WhatsApp',
        lead: 'Cada tipo de contato tem um texto padrão. As palavras entre chaves são trocadas sozinhas.',
        passos: [
          ['Abra Ajustes › Mensagens', 'Precisa estar no modo administrador para salvar. Há um texto para varejo, um para atacado e um para produto que chegou.', null],
          ['Use as palavras automáticas', '{primeiro_nome} vira o nome do cliente, {vendedor} o vendedor, {loja} o nome da loja, {produto} o produto pedido e {empresa} a empresa do atacado.', [['chips', ['{primeiro_nome}', '{vendedor}', '{loja}'], []]]],
          ['Salve', 'O novo texto vale para todos os computadores da loja.', [['btn', 'Salvar']]],
        ],
        dica: 'Se não gostar do resultado, use "Voltar ao texto original".',
      },
      {
        id: 'falta', grupo: 'No dia a dia', titulo: 'Produto em falta',
        lead: 'Quando o cliente pede algo que acabou, anote. Quando o produto chegar, o Retornei lembra de avisar.',
        passos: [
          ['Nova venda › Avisar quando chegar', 'Escolha essa opção no alto da janela de cadastro.', [['chips', ['Registrar venda', 'Avisar quando chegar'], [1]]]],
          ['Anote o produto', 'Celular do cliente, produto e quantidade. O pedido aparece em Pedidos como Esperando.', [['in', 'Produto', 'Chá verde 100g']]],
          ['Quando chegar, clique em Chegou', 'Em Pedidos, clique em Chegou no produto. Todos os clientes que pediram esse produto ficam para avisar.', [['btn', 'Chegou']]],
          ['Avise pelo WhatsApp', 'Clique em Avisar: a mensagem já vai com o nome do produto.', [['zap', 'Olá, Bia! Chegou o Chá verde 100g que você pediu…']]],
          ['Feche o pedido', 'Marque Comprou ou Desistiu. Isso aparece nos relatórios.', [['acoes', ['Comprou', 'Desistiu']]]],
        ],
        dica: 'Pedido parado há mais de 30 dias aparece em vermelho, para ninguém esquecer.',
      },
      {
        id: 'clientes', grupo: 'No dia a dia', titulo: 'Clientes',
        lead: 'A lista de todos os clientes da loja, com o histórico de compras de cada um.',
        passos: [
          ['Busque o cliente', 'Pelo nome, empresa ou celular, no campo de busca no alto.', [['in', 'Buscar', 'Bia']]],
          ['Abra a ficha', 'Clique no nome para ver dados, compras e próximos retornos.', null],
          ['Edite o que precisar', 'Dados do cliente: qualquer pessoa. Compras: clique no lápis ao lado da compra.', null],
          ['Excluir (administrador)', 'Marque um ou vários clientes e clique em Excluir. Logo depois aparece "Desfazer".', [['acoes', ['Excluir', 'Desfazer']]]],
          ['Importar planilha (administrador)', 'Traga clientes de uma planilha .xlsx ou .csv. O Retornei mostra o que entra antes de importar.', null],
        ],
        dica: 'Clientes importados ficam marcados como "Importados da planilha" no filtro de origem.',
      },
      {
        id: 'relatorios', grupo: 'Gestão', titulo: 'Relatórios',
        lead: 'Quantos clientes foram chamados, quantos voltaram a comprar e quanto isso vendeu.',
        passos: [
          ['Escolha o período', 'Esta semana, Este mês ou 3 meses. A comparação é com o período anterior.', [['chips', ['Esta semana', 'Este mês', '3 meses'], [1]]]],
          ['Filtre por vendedor', 'Para ver o resultado de uma pessoa só.', null],
          ['Entenda os números', 'Contatos feitos: mensagens enviadas. Voltaram a comprar: clientes com compra nova até 30 dias depois do contato. Vendas de retorno: o valor dessas compras.', null],
          ['Imprimir ou PDF (administrador)', 'No modo administrador aparecem Imprimir e Exportar PDF.', [['acoes', ['Imprimir', 'Exportar PDF']]]],
        ],
        dica: 'Os relatórios contam todos os computadores juntos.',
      },
      {
        id: 'equipe', grupo: 'Gestão', titulo: 'Equipe e administradores',
        lead: 'Vendedores usam o Retornei sem senha. Excluir, mexer na equipe, importar e exportar é com o administrador.',
        passos: [
          ['Entre como administrador', 'Clique em Administrador, no rodapé do menu, e digite a sua senha. Para sair, clique no botão de sair do selo laranja.', [['btn', 'Entrar']]],
          ['Adicione vendedores', 'Equipe › Vendedores: digite o nome e clique em Adicionar.', [['in', 'Nome do novo vendedor', 'Fernanda Lima']]],
          ['Desativar ou excluir', 'Desativar: some dos cadastros novos, mas fica na lista. Excluir: sai da lista. Nos dois casos, as vendas continuam nos relatórios.', [['acoes', ['Desativar', 'Excluir']]]],
          ['Administradores', 'Equipe › Administradores: nome e função que aparecem na hora de entrar. A conta e a senha de um novo administrador são criadas pelo suporte do sistema.', null],
        ],
        dica: 'Esqueceu de sair do modo administrador? Ele desliga quando o Retornei é fechado.',
      },
      {
        id: 'ajustes', grupo: 'Gestão', titulo: 'Ajustes e backup',
        lead: 'Configurações da loja e deste computador.',
        passos: [
          ['Loja', 'Nome e WhatsApp da loja, aviso da manhã e abrir junto com o Windows.', null],
          ['Prazos de retorno', 'Em quantos dias o cliente volta para a fila, separado para varejo e atacado.', [['chips', ['15 dias', '30 dias', '60 dias'], [1]]]],
          ['Aparência e WhatsApp', 'Tema claro ou escuro e como abrir o WhatsApp. Vale só para este computador.', null],
          ['Dados e backup', 'Os dados ficam na nuvem e cada computador guarda uma cópia por dia. "Salvar cópia" gera um arquivo para guardar onde quiser.', [['acoes', ['Salvar cópia', 'Restaurar cópia']]]],
        ],
        dica: 'Ajustes da loja valem para todos os computadores. Tema e WhatsApp são de cada computador.',
      },
    ],
    duvidas: [
      ['O que acontece se a internet cair?', 'O Retornei continua funcionando. Tudo o que for feito fica guardado neste computador e sobe para a nuvem quando a conexão voltar. No rodapé do menu aparece "Sem internet · salvo aqui". Só entrar como administrador precisa de internet.'],
      ['Cadastrei no Balcão 01, aparece no Balcão 02?', 'Sim, em poucos segundos. Se o rodapé do menu mostrar "Sincronizado", está tudo igual nos dois.'],
      ['Excluí um cliente sem querer. E agora?', 'Logo depois de excluir aparece "Desfazer" no pé da tela. Se já passou, fale com o suporte: existe cópia diária dos dados.'],
      ['Como adicionar um vendedor novo?', 'Entre como administrador, abra Equipe › Vendedores, digite o nome e clique em Adicionar.'],
      ['Esqueci a senha de administrador.', 'Na tela de entrar como administrador, clique em Esqueci a senha. Chega um e-mail para criar a senha nova.'],
      ['O aviso da manhã não apareceu.', 'O Retornei precisa estar aberto. Deixe ligado "Abrir junto com o Windows" em Ajustes › Loja: assim ele abre sozinho quando o computador liga.'],
      ['Como trocar a mensagem do WhatsApp?', 'Para um cliente só: mude o texto na tela Hoje antes de enviar. Para todos: Ajustes › Mensagens, no modo administrador.'],
      ['O WhatsApp abre no navegador em vez do aplicativo.', 'Em Ajustes › Aparência e WhatsApp, escolha "Aplicativo do computador". Ele precisa estar instalado neste computador.'],
    ],
  };
})();
