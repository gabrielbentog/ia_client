# IA Client

Este repositório contém o cliente frontend da aplicação IA (Inteligência Artificial), empacotado via Docker para facilitar o desenvolvimento e a implantação.

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado na máquina
- Porta **8080** livre para exposição do container

## Como usar com Docker

1. **Build da imagem**

   No diretório raiz do projeto, execute:

   ```bash
   docker build -t ia_client .
   ```

   Isso irá criar uma imagem Docker chamada `ia_client` com base no Dockerfile presente.

2. **Execução do container**

   Após a imagem ser construída, rode o container:

   ```bash
   docker run -d \
     --name ia_client_container \
     -p 8080:8080 \
     ia_client
   ```

   - `-d` faz o container rodar em segundo plano (detached)
   - `--name` atribui um nome amigável ao container
   - `-p 8080:8080` mapeia a porta 8080 do host para a porta 8080 do container

   ⚠️ **Atenção**: Se ao iniciar você notar que a aplicação só está disponível em `0.0.0.0` e não responde em `localhost`, provavelmente o serviço dentro do contêiner está ouvindo apenas em `127.0.0.1`.

   Para garantir que o Next.js (ou seu servidor) ouça em todas as interfaces de rede, ajuste o comando de start no `Dockerfile` ou no `package.json`:

   ```jsonc
   // package.json
   {
     "scripts": {
       "start": "next start -p 8080 -H 0.0.0.0"
     }
   }
   ```

   Ou, se preferir, defina a variável de ambiente `HOST`:

   ```bash
   docker run -d \
     --name ia_client_container \
     -e HOST=0.0.0.0 \
     -p 8080:8080 \
     ia_client
   ```

3. **Acessar a aplicação**

   Abra seu navegador em:

   ```
   http://localhost:8080
   ```

## Variáveis de ambiente (opcional) (opcional)

Se sua aplicação requer variáveis de ambiente, você pode passá-las através de um arquivo `.env` ou diretamente no comando `docker run`:

```bash
docker run -d --name ia_client_container \
  -p 8080:8080 \
  -e API_URL=https://api.exemplo.com \
  ia_client
```

Ou usando um `.env`:

```bash
# .env
API_URL=https://api.exemplo.com
```

```bash
docker run -d --name ia_client_container \
  --env-file .env \
  -p 8080:8080 \
  ia_client
```

## Contribuindo

1. Fork este repositório
2. Crie uma branch com sua feature: `git checkout -b feature/nova-coisa`
3. Commit suas alterações: `git commit -m "feat: descrição da feature"`
4. Push na branch: `git push origin feature/nova-coisa`
5. Abra um Pull Request

---

Qualquer dúvida ou sugestão, fique à vontade para abrir uma issue ou entrar em contato com o time de desenvolvimento.
