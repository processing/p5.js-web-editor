# Extenções propostas para a API pública

Esse documento descreve as extenções propostas para a API pública. Nenhuma dessas extenções estão confirmadas, mas estão registradas aqui para referência e discussão.

Referência para a [API pública](./public_api.md) para a atual versão da API.

# Autenticação

- Suporte para o envio de tokens podem ser utilizando `Authorization: Bearer {seu_token_de_acesso}` no lugar de apenas Auth básico

# Acesso à API

- A escrita na API é limitada à uma taxa de X por segundo, por token de acesso
- Operações são transacionais, e.g. se um arquivo é de alguma forma inválido, o esboço não será salvo parcialmente

# Endpoints da API proposta

## Esboços

## `GET /:user/sketches/:id`

Buscar um esboço

### Formato da requisição
Sem corpo.

### Formato da resposta
Retorna `Sketch`.

### Exemplo

    GET /p5/sketches/Ckhf0APpg`
    
    {
      "name": "Another title",
      "slug": "example-1",
      "files": {
        "index.html": { "<DOCTYPE html!><body>Hallo!</body></html>" },
        "something.js": { "var uselessness = 12;" }
      }
    }

### Respostas

| Código HTTP   | Descrição                        |
| ------------- | -------------------------------- |
| 200 OK        | Retorna o ID de um esboço criado |
| 404 Not Found | Esboço não existe                |


## `PUT /:user/sketches/:id`

Substitui o esboço por um inteiramente novo, mantendo o mesmo ID. Qualquer arquivo existente será apagado antes que os novos sejam criados.

### Formato da requisição
Veja `Sketch` nas Models abaixo.

### Formato de resposta
Sem corpo.

### Exemplo

    PUT /p5/sketches/Ckhf0APpg
    
    {
      "name": "Another title",
      "files": {
        "index.html": { "content": "<DOCTYPE html!><body>Hallo!</body></html>" },
        "something.js": { "content": "var uselessness = 12;"
      }
    }

### Respostas

| Código HTTP              | Descrição                                                  |
| ------------------------ | ---------------------------------------------------------- |
| 200 OK                   |                                                            |
| 404 Not Found            | Esboço não existe                                          |
| 422 Unprocessable Entity | validação de arquivo falhou, tipo de arquivo não suportado |


## `PATCH /:user/sketches/:id`

Atualiza o esboço enquanto mantém informações existentes:

- Mudar o nome
- Atualizar conteúdo de arquivo ou adicionar novos arquivos

### Formato da requisição
Veja `Sketch` nas Models abaixo.

### Formato da resposta
Sem corpo.

### Exemplo
Mudar o nome do esboço

    PATCH /p5/sketches/Ckhf0APpg
    
    {
      "name": "My Very Lovely Sketch"
    }

### Exemplo
Adicionar um arquivo ao esboço ou substituir um arquivo existente.

    PATCH /p5/sketches/Ckhf0APpg
    
    {
      "files": {
        "index.html": { "content": "My new content" }, // contents will be replaced
        "new-file.js": { "content": "some new stuff" } // new file will be added
      }
    }

### Respostas

| Código HTTP              | Descrição                      |
| ------------------------ | ------------------------------ |
| 200 OK                   | Mudança foi feita              |
| 404 Not Found            | Esboço não existe              |
| 422 Unprocessable Entity | Erro de validação dos arquivos |


## Operando em arquivos dentro de um esboço

Arquivos dentro de um esboço podem ser acessados individualmente pelos seus `path` e.g `data/something.json`.

## `GET /:user/sketches/:id/files/:path`

Buscar os conteúdos de um arquivo.

### Formato da requisição
Sem corpo.

### Formato da resposta
Retorna conteúdo dos arquivos

### Exemplo

    GET /p5/sketches/Ckhf0APpg/files/assets/something.js
    
    Content-Type: application/javascript
    
    var uselessness = 12;

### Respostas

| Código HTTP   | Descrição                                                                     |
| ------------- | ----------------------------------------------------------------------------- |
| 200 OK        | Retorna corpo do arquivo com o content-type definido pela extenção do arquivo |
| 404 Not Found | Arquivo não existe                                                            |


## `PATCH /:user/sketches/:id/files/:path` 

Atualizar o nome ou conteúdos de um arquivo ou diretório.

### Formato da requisição
Veja `File` e `Directory` abaixo.

### Formato da resposta
Sem corpo.

### Exemplo: Mudar nome do arquivo

    PATCH /p5/sketches/Ckhf0APpg/files/assets/something.js
    
    {
      "name": "new-name.js"
    }

Arquivo `assets/something.js` → `assets/new-name.js`.

### Exemplo: Mudar o conteúdo do arquivo

    PATCH /p5/sketches/Ckhf0APpg/files/assets/something.js
    
    {
      "content": "var answer = 24;"
    }

Conteúdo de `assets/something.js` será substituído por `var answer = 24;`.

### Exemplo: Criar diretório

    PATCH /p5/sketches/Ckhf0APpg/files/assets
    {
      "files": {
        "info.csv": { "content": "some,good,data" }
      }
    }

`assets/data/info.csv` irá existir com o conteúdo `some,good,data`

Arquivos são adicionados ao diretório, em adição à o que está lá.

### Respostas

| Código HTTP              | Descrição                     |
| ------------------------ | ----------------------------- |
| 200 OK                   | As mudanças foram feitas      |
| 404 Not Found            | Caminho não existe            |
| 422 Unprocessable Entity | Erro de validação de arquivos |


## `DELETE /:user/:sketches/files/:path`

Delete um arquivo/diretório e seus conteúdos.

### Formato da requisição
Sem corpo.

### Formato da resposta
Sem corpo.

### Exemplo: Deletar arquivo

    DELETE /p5/sketches/Ckhf0APpg/files/assets/something.js

`assets/something.js` será removido do esboço.

### Exemplo: Deletar diretório

    DELETE /p5/sketches/Ckhf0APpg/files/assets

O diretório `assets` e tudo dentro dele será removido.

### Respostas

| Código HTTP   | Descrição           |
| ------------- | ------------------- |
| 200 OK        | O item foi deletado |
| 404 Not Found | Caminho não existe  |



