Quem começa a estudar tipos em Go inevitavelmente encontra um chamado `rune`. 

De forma simples: uma `rune` representa um caractere Unicode em Go.

O Unicode é um padrão que define identificadores únicos para caracteres do mundo inteiro. Letras, números, símbolos, emojis e caracteres de idiomas como chinês, japonês e árabe possuem um valor único dentro desse padrão.

Por exemplo, o caractere:

```text
汉
```

possui o identificador:

```text
U+6C49
```

Esse identificador é chamado de *code point*.

Um code point é o valor numérico que o Unicode utiliza para identificar unicamente um caractere. É como se cada caractere tivesse um “ID” próprio dentro da tabela Unicode.

Em Go, uma `rune` representa exatamente isso: um *Unicode code point*.

Por baixo dos panos, `rune` é apenas um `int32`:

```go
type rune = int32
```

Isso acontece porque um *code point Unicode* pode precisar de até 32 bits para ser armazenado em memória.

E aqui entra uma analogia importante.

Pense no Unicode como uma lista gigantesca onde cada caractere possui um número de identificação. A rune guarda esse número.

Mas guardar o número em memória é diferente de transmitir ou salvar esse valor em bytes. Para isso existe a codificação.

Uma codificação define como um caractere será convertido em bytes.

No caso do Go, a codificação utilizada no código-fonte é o UTF-8.

O UTF-8 pega um code point Unicode e o transforma em uma sequência de 1 até 4 bytes. Como 8 bits equivalem a 1 byte, isso significa que um caractere pode ocupar até 32 bits quando codificado.

Caracteres simples usam menos espaço:

```go
s := "A"

fmt.Println(len(s))
```

Resultado:

```text
1
```

A letra `A` ocupa apenas 1 byte em UTF-8.

Agora veja este exemplo:

```go
s := "汉"

fmt.Println(len(s))
```

Resultado:

```text
3
```

Mesmo sendo apenas um caractere, ele ocupa 3 bytes em UTF-8.

Esse é um dos pontos mais importantes para entender strings em Go: strings são sequências de bytes, enquanto runas representam caracteres Unicode.

É exatamente por isso que o `len` pode retornar valores diferentes dependendo do caractere utilizado. O `len` mede bytes, não caracteres.

Na prática, podemos trabalhar diretamente com runas:

```go
var r rune = 'A'

fmt.Println(r)
```

Saída:

```text
65
```

O número `65` é o valor Unicode da letra `A`.

Com outros caracteres acontece a mesma coisa:

```go
var r rune = '汉'

fmt.Println(r)
```

Saída:

```text
27721
```

Ou seja, uma rune não armazena “o desenho” do caractere. Ela armazena o valor Unicode que identifica esse caractere.

Esse conceito pode parecer pequeno no começo, mas ele é fundamental para entender como strings funcionam em Go. Principalmente quando começamos a trabalhar com caracteres acentuados, emojis e textos internacionalizados.