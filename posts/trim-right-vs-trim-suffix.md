As funções `strings.TrimRight` e `strings.TrimSuffix`, mesmo parecendo iguais e ambas sejam utilizadas para remover caracteres no final de uma string, o comportamento de cada uma é bastante diferente. 


## strings.TrimRigh

Vamos ver o seguinte exemplo:

```go
fmt.Println(strings.TrimRight("321aba", "ba"))
```
Qual seria o resultado?

```text
321a ou 321
```

O certo é `321`.

Isso acontece pois a função `TrimRight` remove todos os caracteres finais que pertençam ao conjunto informado no segundo argumento.

No exemplo apresentado o conjunto é formado por `ba`, então ele vai remover todos os caracteres `a` e todos os `b` até um caracter fora do conjunto aparecer.

O ponto importante é que `TrimRight` não procura uma sequência específica. Ele verifica caractere por caractere, removendo tudo o que fizer parte do conjunto informado.

## TrimSuffix

Agora veja o mesmo exemplo utilizando `TrimSuffix`:

```go
fmt.Println(strings.TrimSuffix("321aba", "ba"))
// 321a
```

Diferentemente de `TrimRight`, a função `TrimSuffix` verifica se a string termina exatamente com o sufixo especificado.

Como `"321aba"` termina com `"ba"`, apenas essa ocorrência final é removida.

Outro exemplo:

```go
fmt.Println(strings.TrimSuffix("321ababa", "ba"))
// 321aba
```

Observe que apenas uma ocorrência do sufixo é removida. A operação não é repetida.

## O mesmo conceito para o início da string

A biblioteca `strings` oferece funções equivalentes para o início da string que são a `TrimLeft` e a `TrimePrefix` que funcionam da mesma forma das apresentadas.

## E a função Trim?

A função `Trim` combina o comportamento de `TrimLeft` e `TrimRight`.

Exemplo:

```go
fmt.Println(strings.Trim("aba321aba", "ba"))
// 321
```

Todos os caracteres `a` e `b` presentes no início e no final da string são removidos.

## Conclusão

As funções possuem nomes semelhantes, mas resolvem problemas diferentes:

| Função | Comportamento |
|---------|--------------|
| `TrimRight` | Remove caracteres finais pertencentes a um conjunto |
| `TrimLeft` | Remove caracteres iniciais pertencentes a um conjunto |
| `TrimSuffix` | Remove um sufixo específico |
| `TrimPrefix` | Remove um prefixo específico |
| `Trim` | Remove caracteres do conjunto no início e no fim da string |

Sempre que a intenção for remover uma palavra, extensão ou trecho específico, utilize `TrimSuffix` ou `TrimPrefix`.

Já quando o objetivo for eliminar qualquer combinação de caracteres pertencentes a um conjunto, as funções `TrimLeft`, `TrimRight` e `Trim` são as opções corretas.