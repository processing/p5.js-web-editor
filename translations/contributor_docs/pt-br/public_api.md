# API Pública

Essa API provê uma forma de importar informações para o p5.js Web Editor de forma programática.

# Authenticação 

Acesso à API está disponível via um Token de Acesso Pessoal, relacionado à uma conta de editor existente. Tokens podem ser criados e deletados na tela de Configurações de um usuário loggado.

Quando entrar em contato com a API, o nome de usuário e token devem ser enviados em todas requisições usando autenticação básica.

Isso envolve enviar o base64 codificado `${username}:${personalAccessToken}` no header `Authorization`, Por exemplo:
  `Authorization: Basic cDU6YWJjMTIzYWJj`

# Acesso à API

- Toda requisição envia e recebe `Content-Type: application/json` a não ser que seja declarado o contrário

# Versionamento

A API é versionada e essa versão está indicada no caminho raíz da URL e.g. a versão 1 da API pode ser encontrada em `http://editor.p5js.org/api/v1`.

Você deve fornecer o número da versão quando acessar a API.

| Versão | Data de lançamento |
| ------ | ------------------ |
| v1     | Não lançado        |

# Models

A API aceita e retorna as seguintes Models como JSON.

## Sketch

| Nome  | Tipo              | Descrição                                                                      |
| ----- | ----------------- | ------------------------------------------------------------------------------ |
| name  | String            | O título do esboço                                                             |
| files | DirectoryContents | Os arquivos e diretórios no esboço. Veja `DirectoryContents` para a estrutura. |
| slug  | String            | Um caminho que pode ser usado para acessar o esboço                            |


    {
      "id": String, // opaque ID
      "name: String,
      "files": DirectoryContents,
      "slug": String // optional
    }

### Validações

- `files` devem ter exatamente exatamente um arquivo no nível mais alto com a extenção `.html`. Se nenhum for fornecido um `index.html` padrão e um `style.css` associado serão automaticamente criados.
- `slug` deve ser uma string segura pra URL
- `slug` deve ser única entre todos os esboços do usuário

## DirectoryContents

Um map de nomes de arquivo para `File` ou `Directory`. A chave para cada item é usada como nome do arquivo. Usar um map assegura que nomes de arquivo sejam únicos no diretório.

    {
      [String]:  File | Directory
    }


    {
      "sketch.js": { "content": "var answer = 42;" },
      "index.html" { "content": "..." }
    }

## DirectFile

Isso é editável na interfáce do editor e guardada no bando de dados do Editor.

| Nome    | Tipo         | Descrição                                   |
| ------- | ------------ | ------------------------------------------- |
| content | UTF-8 String | O conteúdo do arquivo como uma UTF-8 string |

    {
      "content": String
    }

## ReferencedFile

Esse arquivo é hospedado em outro lugar na Internet. Ele aparece na listagem do Editor e pode ser referenciado usando um proxy URL no Editor.


| Nome | Tipo | Descrição                                                         |
| ---- | ---- | ----------------------------------------------------------------- |
| url  | URL  | Uma URL váçida apontando para um arquivo hospedado em outro lugar |

    {
      "url": URL
    }

## File

Um `File` é ou um `DirectFile` ou um `ReferencedFile`. A API suporta os dois em todo lugar.

## Directory

| Nome  | Tipo              | Description                        |
| ----- | ----------------- | ---------------------------------- |
| files | DirectoryContents | Um map dos conteúdos ddo diretório |

    {
      "files": DirectoryContents
    }

# Endpoints da API

## Sketches

## `GET /:user/sketches`

Liste os esboços de um usuário.

Isso não irá retornar os arquivos dentro de um esboço, apenas a metadata do esboço.

### Formato da requisição
Sem corpo.

### Formato da resposta
    {
      "sketches": Array<Sketch>
    }

### Exemplo

    GET /p5/sketches
    
    {
      "sketches": [
        { "id": "H1PLJg8_", "name": "My Lovely Sketch" },
        { "id": "Bkhf0APpg", "name":  "My Lovely Sketch 2" }
      ]
    }


## `POST /:user/sketches`

Criar um novo esboço.

Um esboço deve conter pelo menos um arquivo com a extenção `.html`. Se nenhum for fornecido no payload, um `index.html` padrão e um arquivo `style.css` associado serão criados automaticamente.

### Formato da requisição
Veja `Sketch` nas Models abaixo.

### Formato da resposta
    {
      "id": String
    }

### Exemplo

    POST /p5/sketches
    
    {
      "name": "My Lovely Sketch",
      "files": {
        "index.html": { "content": "<DOCTYPE html!><body>Hello!</body></html>" },
        "sketch.js": { "content": "var useless = true;" }
      }
    }

`files` podem possuir uma hierarquia para representar uma estrutura de pastas. Por exemplo, isso irá criar um diretório "data" vazio no esboço:


    POST /p5/sketches
    
    {
      "name": "My Lovely Sketch 2",
      "files": [
        {
           "name": "assets",
           "type": "",
           "files": {
            "index.html": { "content": "<DOCTYPE html!><body>Hello!</body></html>" },
            "data": {
              "files": {}
            }
          }
       }
    }

### Respostas

| Código HTTP              | Descrição                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- |
| 201 Created              | id do esboço                                                                    |
| 422 Unprocessable Entity | falha na validação de um arquivo, tipo de arquivo não suportado, slug já existe |


### Exemplos

    201 CREATED
    
    {
      "id": "Ckhf0APpg"
    }

## `DELETE /:user/sketches/:id`

Delete um esboço e todos os seus arquivos associados.

### Formato da requisição
Sem corpo

### Formato da resposta
Sem corpo

### Exemplo

    DELETE /p5/sketches/Ckhf0APpg

### Respostas

| Código HTTP   | Description         |
| ------------- | ------------------- |
| 200 OK        | Esboço foi deletado |
| 404 Not Found | Esboço não existe   |
