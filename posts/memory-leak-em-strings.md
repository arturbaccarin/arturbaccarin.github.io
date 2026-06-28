Strings em Go são estruturas imutáveis compostas por um ponteiro para uma sequência de bytes e pelo tamanho dessa sequência. 

Essa representação permite que operações como a extração de substrings sejam bastante eficientes, pois, em muitas situações, não exigem a cópia dos dados. 

Essa estrutura pode ser observada no [código-fonte do runtime da linguagem](https://cs.opensource.google/go/go/+/refs/tags/go1.25.0:src/runtime/string.go), onde uma string é representada internamente por uma estrutura contendo um ponteiro (unsafe.Pointer) para os bytes e um campo inteiro (len) que armazena seu comprimento.

Entretanto, essa otimização pode produzir um efeito colateral importante. Quando apenas uma pequena parte de uma string grande é mantida em memória, a substring pode continuar referenciando todo o bloco de dados original. Como consequência, uma quantidade significativa de memória permanece alocada desnecessariamente, caracterizando um memory leak lógico.

## Como funciona a operação de substring

A extração de uma substring é realizada utilizando a mesma sintaxe de fatiamento empregada em slices.

```go
text := "Foi o Go que me deu"

substring := text[:8]

fmt.Println(substring) // Foi o Go
```

Nesse exemplo, a substring corresponde aos primeiros bytes da string original.

É importante observar que o intervalo informado representa bytes, não runes. Isso significa que a operação é segura apenas quando os limites coincidem com os limites dos caracteres codificados em UTF-8.

> Para saber mais: [O que é Rune?](https://foiogoquemedeu.com.br/posts/o-que-e-rune)

Quando a string contém caracteres que ocupam múltiplos bytes, o correto é convertê-la para `[]rune` antes de realizar o fatiamento.

```go
text := "Programação"

runes := []rune(text)

substring := string(runes[:7])

fmt.Println(substring) // Program
```

Nesse caso, a conversão garante que o corte seja realizado considerando caracteres Unicode completos, evitando a divisão de uma sequência UTF-8.

## O problema da retenção de memória

O principal problema não está na operação de substring em si, mas no fato de que a implementação do compilador padrão de Go compartilha o mesmo bloco de memória entre a string original e sua substring.

Essa estratégia evita uma nova alocação e melhora o desempenho na maioria dos casos. Entretanto, quando a string original é muito grande e apenas uma pequena parte precisa permanecer em memória, toda a área originalmente alocada continua sendo mantida enquanto existir qualquer referência à substring.

Imagine uma aplicação que recebe documentos completos contendo centenas de kilobytes, mas necessita armazenar apenas um identificador localizado no início de cada registro.

Uma implementação aparentemente simples seria:

```go
func extractID(record string) string {
    return record[:12]
}
```

O código retorna apenas doze bytes. Porém, caso `record` possua centenas de kilobytes, a string retornada poderá continuar referenciando toda a memória originalmente utilizada pelo documento.

Se milhares desses identificadores forem armazenados em cache, a aplicação poderá consumir muito mais memória do que o esperado.

## Por que isso acontece

Embora uma string seja imutável, sua estrutura interna é pequena. Ela contém basicamente:

* Um ponteiro para os bytes.
* O comprimento da sequência.

A substring normalmente cria apenas uma nova estrutura apontando para uma posição diferente dentro do mesmo bloco de memória.

Enquanto a substring existir, o garbage collector não poderá liberar a memória correspondente ao documento original.

## Criando uma cópia independente

Quando apenas a substring será mantida por um longo período, a solução consiste em criar uma cópia independente da sequência de bytes.

Uma forma tradicional é converter a substring para `[]byte` e, em seguida, reconstruir uma nova string.

```go
func extractID(record string) string {
    return string([]byte(record[:12]))
}
```

Embora essa conversão pareça redundante, ela possui um efeito importante.

Primeiro é criado um novo slice de bytes contendo apenas os doze bytes desejados. Em seguida, uma nova string é construída sobre esse novo bloco de memória.

O resultado deixa de compartilhar a memória da string original.

## Utilizando strings.Clone

A partir do Go 1.18, a biblioteca padrão passou a fornecer uma alternativa mais clara para esse cenário.

```go
func extractID(record string) string {
    return strings.Clone(record[:12])
}
```

`strings.Clone` cria explicitamente uma nova cópia da string, eliminando o compartilhamento do backing array original.

Além de tornar a intenção do código mais evidente, essa abordagem evita a necessidade das conversões intermediárias entre `string` e `[]byte`.

## Atenção aos avisos da IDE

Algumas IDEs e ferramentas de análise estática podem indicar que uma conversão como `string([]byte(s))` é redundante.

Do ponto de vista do tipo retornado, a observação parece correta, pois o resultado continua sendo uma string.

Entretanto, nesse contexto a conversão possui um efeito semântico importante. Ela força a criação de uma nova alocação, impedindo que a substring continue compartilhando a memória da string original.

Portanto, nem todo aviso de otimização deve ser aceito automaticamente. É necessário compreender o comportamento de memória da linguagem antes de remover esse tipo de conversão.

## Passagem de strings para funções

Outro ponto importante é que passar uma string como argumento para uma função não realiza uma cópia profunda dos bytes.

> Uma cópia profunda (deep copy) consiste na criação de uma nova estrutura de dados com seu próprio espaço de memória, de modo que o objeto copiado não compartilhe internamente os mesmos dados da estrutura original.

> Na cópia rasa (shallow copy), uma nova estrutura é criada, mas ela continua compartilhando internamente os mesmos dados da estrutura original. Ou seja, copia-se apenas a estrutura "externa", enquanto os dados subjacentes permanecem referenciados por ambos os objetos.

Considere o exemplo:

```go
func save(valor string) {
    // ...
}

func proccess(record string) {
    id := record[:12]
    save(id)
}
```

Embora `id` seja passado para outra função, ele continua referenciando o mesmo bloco de memória utilizado por `record`.

A simples passagem por parâmetro não elimina o compartilhamento do `backing array`.

## Quando realmente é necessário copiar

Criar uma nova alocação possui custo de memória e processamento. Portanto, copiar toda substring indiscriminadamente também não é desejável.

A cópia é recomendada principalmente quando:

* A string original é muito grande.
* Apenas uma pequena parte será preservada.
* A substring permanecerá armazenada por um período significativo, como em caches, mapas ou estruturas persistentes em memória.

Quando a substring possui tempo de vida semelhante ao da string original, normalmente não existe benefício em realizar a cópia.

## Boas práticas

Ao trabalhar com substrings em Go, algumas recomendações ajudam a evitar retenções desnecessárias de memória.

* Lembrar que os índices da operação de substring representam bytes.
* Converter para `[]rune` quando a operação precisar considerar caracteres Unicode.
* Criar uma cópia da substring quando ela sobreviver por muito mais tempo que a string original.
* Preferir `strings.Clone` em versões modernas da linguagem quando o objetivo for obter uma cópia independente.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.
