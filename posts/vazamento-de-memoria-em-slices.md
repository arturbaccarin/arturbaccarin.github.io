O **vazamento de memória (memory leak)** acontece quando um programa continua ocupando memória que já não precisa, sem liberá-la. Com o tempo, isso faz o consumo crescer continuamente.

Em Go, esse problema costuma ocorrer quando objetos continuam **referenciados,** por exemplo, em slices, maps, goroutines ou variáveis globais. Como o **garbage collector** só libera aquilo que não possui mais referências, a memória permanece ocupada desnecessariamente.

## Vazamento causado pela capacidade do slice

Imagine uma mensagem com **1 milhão de bytes**, onde os **5 primeiros bytes representam o tipo da mensagem**:

```go
func consumeMessage() {
    msg := receiveMessage()
    messageType := getMessageType(msg)
}

func getMessageType(msg []byte) []byte {
    return msg[:5]
}
```

A função `getMessageType` retorna apenas os 5 primeiros bytes do slice. À primeira vista, parece que estamos guardando somente 5 bytes. Porém, isso pode gerar **alto consumo de memória**.

A operação `msg[:5]` cria um novo slice com:

- **tamanho:** 5  
- **capacidade:** igual à do array original (1 milhão de bytes)

Isso ocorre porque o novo slice ainda aponta para o **mesmo array subjacente**. 

Enquanto esse pequeno slice existir, o garbage collector **não poderá liberar o array inteiro**.

## Solução: copiar apenas o necessário

A forma correta de evitar esse problema é copiar somente os bytes que realmente precisamos:

```go
func getMessageType(msg []byte) []byte {
    msgType := make([]byte, 5)
    copy(msgType, msg)
    return msgType
}
```

Agora o slice `msgType` possui:

- **comprimento:** 5  
- **capacidade:** 5  

Assim, apenas os 5 bytes necessários permanecem na memória, permitindo que o array original seja coletado pelo garbage collector.

> O full slice expression resolve?
>
> Uma alternativa comum para copiar slices é usar o **full slice expression**: msg[:5:5]
>
> Isso cria um slice com comprimento 5 e capacidade 5.  
> À primeira vista, parece resolver o problema. Porém, na prática, o **array subjacente continua referenciado**.
>
> Ou seja, o garbage collector **não consegue liberar a memória do restante do array**.

## Vazamento com slices contendo ponteiros

Outro tipo de vazamento acontece quando o slice contém **ponteiros** ou **estruturas com campos que são ponteiros**.

Isso ocorre porque, mesmo que parte do slice não esteja mais acessível pelo código, os elementos ainda permanecem no **array subjacente**. Se esses elementos contiverem ponteiros, o garbage collector entende que ainda existem referências ativas e não pode liberar a memória.

Imagine uma estrutura `Foo` que contém um slice interno:

```go
type Foo struct {
    data []byte
}
```

Agora, suponha que temos um slice com **1.000 elementos**, onde cada um contém um buffer interno de dados:

```go
func createFoos() []Foo {
    foos := make([]Foo, 1000)
    for i := range foos {
        foos[i].data = make([]byte, 1024)
    }
    return foos
}
```

Agora, imagine que queremos manter apenas os dois primeiros elementos:

```go
func keepFirstTwoElementsOnly(foos []Foo) []Foo {
    return foos[:2]
}
```

À primeira vista, parece que estamos mantendo apenas dois elementos. Mas, na prática, os **outros 998 elementos continuam no array subjacente**.

Como cada elemento possui um slice interno (`data`), esses buffers ainda estão referenciados. Consequentemente, o garbage collector **não pode liberar a memória dos 998 elementos restantes**.

## Solução 1: copiar os elementos necessários

```go
func keepFirstTwoElementsOnly(foos []Foo) []Foo {
    res := make([]Foo, 2)
    copy(res, foos)
    return res
}
```

## Solução 2: zerar explicitamente os elementos restantes

Se for necessário manter a capacidade original:

```go
func keepFirstTwoElementsOnly(foos []Foo) []Foo {
    for i := 2; i < len(foos); i++ {
        foos[i].v = nil
    }
    return foos[:2]
}
```

Como os campos restantes foram definidos como `nil`, o garbage collector pode liberar os dados internos.

## Regra geral para evitar memory leak com slices

Sempre que extrair uma pequena parte de um slice grande:

- **Se o slice original não for mais necessário, use** `copy`.  
- **Evite manter referências desnecessárias ao array subjacente.**

Isso evita crescimento silencioso de memória e problemas em sistemas de longa duração.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.