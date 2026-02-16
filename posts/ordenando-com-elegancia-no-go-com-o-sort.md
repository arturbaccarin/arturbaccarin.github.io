A ordenação de elementos em um *array* é uma tarefa frequentemente utilizada em diversos programas. Embora existam muitos algoritmos de ordenação bem conhecidos, ninguém quer ficar copiando blocos de código de um projeto para outro.

Por isso, o Go oferece a biblioteca nativa `sort`.

Ela permite ordenar *arrays in-place* (a ordenação é feita diretamente na estrutura de dados original, sem criar uma cópia adicional do *array*) com qualquer critério de ordenação, utilizando uma abordagem baseada em interfaces. 

A função `sort.Sort` não faz suposições sobre a estrutura dos dados; ela apenas exige que o tipo a ser ordenado implemente a interface `sort.Interface`, que define três métodos essenciais apresentados a seguir.

```go
type Interface interface {
    // Len é a quantidade de elementos da coleção.
    Len() int

    // Less informa se o elemento com índice i
    // deve ser ordenado antes do elemento com índice j.
    //
    // Se tanto Less(i, j) quanto Less(j, i) forem falsos,
    // então os elementos nos índices i e j são considerados iguais.
    // Sort pode colocar elementos iguais em qualquer ordem no resultado final.
    //
    // Less deve descrever uma ordenação transitiva:
    // - se Less(i, j) e Less(j, k) forem ambos verdadeiros, então Less(i, k) também deve ser verdadeiro.
    // - se Less(i, j) e Less(j, k) forem ambos falsos, então Less(i, k) também deve ser falso.
    Less(i, j int) bool

    // Swap inverte os elementos das posições i e j
    Swap(i, j int)
}
```

Um ótimo exemplo inicial é o tipo `sort.StringSlice`, fornecido pela própria biblioteca `sort`. Ele já implementa a interface `sort.Interface`, conforme mostrado abaixo:

```go
// sort.StringSlice
type StringSlice []string

func (x StringSlice) Len() int           { return len(x) }
func (x StringSlice) Less(i, j int) bool { return x[i] < x[j] }
func (x StringSlice) Swap(i, j int)      { x[i], x[j] = x[j], x[i] }

// Exemplo de uso
func main() {
    fruits := []string{"banana", "cherry", "apple"}

    s := sort.StringSlice(fruits)
    s.Sort()

    fmt.Println("Sorted fruits:", s) // Sorted fruits: [apple banana cherry]
}
```

Seguindo essas regras, é possível ordenar `structs` com base em seus campos como no exemplo a seguir, que ordena uma lista de alunos pela nota:

```go
package main

import (
    "fmt"
    "sort"
)

type Student struct {
    Name       string
    FinalGrade float64
}

type Students []Student

func (s Students) Len() int {
    return len(s)
}

func (s Students) Less(i, j int) bool {
    return s[i].FinalGrade < s[j].FinalGrade
}

func (s Students) Swap(i, j int) {
    s[i], s[j] = s[j], s[i]
}

func main() {
    students := Students{
        {Name: "Alice", FinalGrade: 88.5},
        {Name: "Bob", FinalGrade: 92.0},
        {Name: "Charlie", FinalGrade: 85.0},
    }

    sort.Sort(students)

    for _, student := range students {
        fmt.Printf("Name: %s, Final Grade: %.2f\n", student.Name, student.FinalGrade)
    }

    // Output:
    // Name: Charlie, Final Grade: 85.00
    // Name: Alice, Final Grade: 88.50
    // Name: Bob, Final Grade: 92.00
}
```

Com a estrutura já definida, também é possível verificar se o *array* está ordenado usando `sort.IsSorted`, além de realizar a ordenação em ordem reversa com `sort.Reverse`. As funções são demonstradas abaixo, utilizando a mesma estrutura do exemplo anterior.

```go
// Código do exemplo anterior acima
isSorted := sort.IsSorted(students)
fmt.Printf("Is the slice sorted? %v\n", isSorted)
// Output: Is the slice sorted? true

sort.Sort(sort.Reverse(students))
fmt.Println("Sorted in reverse order:")
for _, student := range students {
    fmt.Printf("Name: %s, Final Grade: %.2f\n", student.Name, student.FinalGrade)
}

// Output: Sorted in reverse order:
// Name: Bob, Final Grade: 92.00
// Name: Alice, Final Grade: 88.50
// Name: Charlie, Final Grade: 85.00
```

A biblioteca também oferece outras funções bastante úteis:

- `Ints(x []int)`: ordena uma `slice` de inteiros em ordem crescente.

- `IntsAreSorted(x []int) bool`: verifica se o `slice x` está ordenada em ordem crescente.

- `Strings(x []string)`: ordena um `slice` de *strings* em ordem crescente.

- `StringsAreSorted(x []string) bool`: verifica se a `slice x` está ordenada em ordem crescente.

**ATENÇÃO**

Na própria documentação do pacote `sort`, na data de escrita deste artigo, existe uma nota na função `sort.Sort` que diz o seguinte:

> Em muitas situações, a função mais recente `slices.SortFunc` é mais ergonômica e apresenta melhor desempenho.
>
> ```go
func main() {
    names := []string{"Bob", "alice", "VERA"}
    slices.SortFunc(names, func(a, b string) int {
        return strings.Compare(strings.ToLower(a), strings.ToLower(b))
    })
    fmt.Println(names)
}
```

Essa mesma nota se encontra na função `sort.IsSorted`:

> Em muitas situações, a função mais recente `slices.IsSortedFunc` é mais ergonômica e apresenta melhor desempenho.
>
> ```go
func main() {
    names := []string{"alice", "Bob", "VERA"}
    isSortedInsensitive := slices.IsSortedFunc(names, func(a, b string) int {
        return strings.Compare(strings.ToLower(a), strings.ToLower(b))
    })
    fmt.Println(isSortedInsensitive)
    fmt.Println(slices.IsSorted(names))
}
```

Em ambos os casos, recomendo avaliar qual abordagem adotar com base no que for mais vantajoso para a sua situação: a simplicidade das funções do pacote `sort` ou a possível otimização oferecida pelo pacote `slices`.

Para descobrir qual delas apresenta melhor desempenho no seu contexto, utilize os *benchmarks* do Go (fica aqui o dever de casa para você, caro leitor, dar uma conferida nisso).

A partir do **Go 1.22**, algumas funções do pacote `sort` já utilizam a biblioteca `slices` internamente, como é o caso de `sort.Ints`, que usa `slices.Sort`, e `sort.IntsAreSorted`, que usa `slices.IsSorted`.

Para saber mais, confira as documentações oficiais:

`sort`: [https://pkg.go.dev/sort](https://pkg.go.dev/sort)

`slices`: [https://pkg.go.dev/slices](https://pkg.go.dev/slices)

**Referências:**

DONOVAN, Alan A. A.; KERNIGHAN, Brian W.. **The Go Programming Language**. Crawfordsville: Addison-Wesley, 2016.

Documentação oficial da biblioteca `sort`: [https://pkg.go.dev/sort](https://pkg.go.dev/sort)

Documentação oficial da biblioteca `slices`: [https://pkg.go.dev/slices](https://pkg.go.dev/slices)
