# Preparando um pull request

Copiado e atualizado do [repositório do p5.js](https://github.com/processing/p5.js).

Pull-requests são mais fáceis quando seu código está atualizado! Você pode usar git rebase para atualizar seu código para incorporar mudanças de outros contribuidores. Aqui está como.

## Salve e Atualize

### Salve tudo que você tem!
    git status
    git add -u
    git commit


### Descubra a respeito de mudanças
Verifique se você está acompanhando o repositório upstream p5.js.

    git remote show upstream

Se você ver um erro, você terá que começar a acompanhar o repositŕio principal do p5.js como um repositório remoto "upstrem". Você só terá que fazer isso uma vez! Mas nada de ruim irá acontecer se fizer uma segunda vez.

    git remote add upstream https://github.com/processing/p5.js

Então pergunte ao git sobre as últimas mudanças.

    git fetch upstream

### Só para garantir: faça uma cópia das suas mudanças em uma nova branch
    git branch your-branch-name-backup

### Aplique mudanças da branch master, adicione suas mudanças *depois*
    git rebase upstream/master

### Volte para a branch master
    git checkout master

### Ajude outros contribuidores a entender as mudanças que você fez
    git commit -m "Fixed documentation typos"   

### Verifique o que o git estará commitando 
    git status       

## CONFLITOS
Você pode ter alguns conflitos! Tudo bem. Se sinta a vontade para pedir ajuda. Se merjar com a última master upstream causar conflitos, você pode sempre fazer um pull request com o repositório upstream, que torna os conflitos públicos.

## E finalmente, para grande glória
    git push --set-upstream origin your-branch-name-backup

Aqui está uma boa referência sobre rebases, caso você esteja curioso sobre os detalhes técnicos. https://www.atlassian.com/git/tutorials/merging-vs-rebasing
