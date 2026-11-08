const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'style.css'));
});

// Endpoints dos microsserviços internos
const FORECAST_URL = 'http://localhost:4001';
const GEOCODING_URL = 'http://localhost:4002';

// Encaminha consultas de previsão ao microserviço de forecast.
app.use('/api/forecast', async (req, res) => {
  const caminho = req.originalUrl.replace(/^\/api\/forecast(?=\/|\?|$)/, '/forecast');
  
  try {
    const resposta = await axios({
      method: req.method,
      url: `${FORECAST_URL}${caminho}`,
      data: req.body,
      timeout:10000
    });
    return res.status(resposta.status).json(resposta.data);
  } catch (erro) {
    if (erro.response) {
      return res.status(erro.response.status).json(erro.response.data);
    }
    else if(erro.code === 'ECONNABORTED' || erro.code === 'ECONNREFUSED' || !erro.response){
      return res.status(503).json({erro:'Serviço temporáriamente indisponível'});
    }
    return res.status(500).json({ erro: 'Serviço de Produtos indisponível' });
  }
});

// Encaminha buscas de cidade ao microserviço de geocodificação.
app.use('/api/geocoding', async (req, res) => {
  const caminho = req.originalUrl.replace(/^\/api\/geocoding(?=\/|\?|$)/, '/geocoding');
  try {
    const resposta = await axios({
      method: req.method,
      url: `${GEOCODING_URL}${caminho}`,
      data: req.body,
      timeout: 12000
    });
    return res.status(resposta.status).json(resposta.data);
  } catch (erro) {
    if (erro.response) {
      return res.status(erro.response.status).json(erro.response.data);
    }
    if (erro.code === 'ECONNABORTED' || erro.code === 'ECONNREFUSED' || erro.code === 'ECONNRESET') {
      return res.status(503).json({
        erro: 'Serviço de geocodificação indisponível. Verifique se ele está ativo na porta 4002.'
      });
    }
    console.error('Erro ao encaminhar consulta de geocodificação:', erro.message);
    return res.status(502).json({ erro: 'Falha ao consultar o serviço de geocodificação.' });
  }
});
app.get('/api/demorando', async (req, res) => {
  try {
    return res.status(resposta.status).json(resposta.data);
  } catch (erro) {
    if (erro.response) {
      return res.status(erro.response.status).json(erro.response.data);
    }
    console.error('Erro ao encaminhar consulta alternativa de forecast:', erro.message);
    return res.status(503).json({
      erro: 'Serviço de forecast indisponível. Verifique se está ativo na porta 4001.'
    });
  }
});
app.listen(PORT, () => {
  console.log(`[API Gateway] Ativo na porta http://localhost:${PORT}`);
});