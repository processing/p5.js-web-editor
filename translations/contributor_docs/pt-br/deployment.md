# Deploy

Esse documento contém informações sobre como realizar um deploy para produção, todas as plataformas e ferramentas diferentes e como configura-las.

WIP.
* Configuração/Instalação de Produção
* Travis
* Docker Hub
* Kubernetes
* S3
* Mailgun
* Cloudflare
* DNS/Dreamhost
* mLab

## Processo de Deploy

Esses são os passos que acontecem quando você realiza o deploy da aplicação.

1. Faça um push para a a branch `master`, ou faça um merge por um pull request para a branch `master`.
2. Isso dispara uma build no [Travis CI](https://travis-ci.org/processing/p5.js-web-editor).
3. O Travis CI constrói uma imagem Docker (desenvolvimento) de toda a aplicação.
4. O Travis CI realiza alguns testes, que nesse caso são apenas `npm run lint`. Isso pode ser atualizado no futuro para incluir testes mais extensos. Se os testes falharem, a build para aí.
5. Se os testes passarem, então o Travis CI constrói uma imagem Docker (produção) de toda a aplicação.
6. Essa imagem é enviada ao [Docker Hub](https://hub.docker.com/r/catarak/p5.js-web-editor/) com um nome único (O commit Travis) e também para a tag `latest`.
7. O deploy do Kubernetes é atualizado para a imagem que acabou de ser enviada ao Docker Hub no cluster no Google Kubernetes Engine.

## Instalação de Produção

Você só terá que fazer isso se estiver testando o ambinente de produção loclamente.

_Nota_: Os passos de instalação assumem que você está usando um shell baseado em Unix. Se você está usando Windows, você terá que usar `copy` no lugar de `cp`. 

1. Clone esse repositório e use um `cd` para entrar nele
2. `$ npm install`
3. Instale o MongoDB e veja se está rodando
4. `$ cp .env.example .env`
5. (NÃO Opicional) edite `.env` e o preencha com todos os valores necessários
6. `$ npm run fetch-examples` - isso faz o download dos esboços de exemplo para um usuário chamado 'p5'
7. `$ npm run build`
8. Já que produção assume que suas variáveis de ambiente estão no ambiente da shell e não em um arquivo `.env`, você terá que rodar `export $(grep -v '^#' .env | xargs)` ou um comando similar, veja essa [resposta do Stack Overflow](https://stackoverflow.com/a/20909045/4086967).
9. `$ npm run start:prod`

## Auto hospedagem - Deploy no Heroku

Se você está interessado em hospedar e fazer deploy da sua própria instância do Editor Web de p5.js, você pode! Seria o mesmo da instância do editor oficial em editor.p5js.org, porém com um domínio diferente, e você estará responsável pela manutenção. Nós recomendamos usar o Heroku, já que você pode hospeda-lo de graça.

1. Se cadastre para uma conta grátis em: [Heroku](https://www.heroku.com/)
2. Clique aqui: [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/processing/p5.js-web-editor/tree/master)
3. Coloque um *Nome para o App* único, ele fará parte da url(i.e. https://nome-do-app.herokuapp.com/)
4. Atualize qualquer variável de configuração ou aceite os valores default para uma avaliação rápida (elas podem ser alteradas depois para permitir total funcionalidade)
5. Clique no botão "Deploy app" 
6. Quando copleto, clique no botão "View app"
