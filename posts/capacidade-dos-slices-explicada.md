**Arrays**

Os arrays em Go possuem um tamanho fixo e não precisam ser inicializados explicitamente. Isso significa que, quando criados, já estão prontos para uso com todos os seus elementos definidos com os *zero values* do tipo correspondente, caso nenhum valor seja especificado.

```go
var a [4]int
a[0] = 1
i := a[0]
// i == 1

// a[2] == 0
```

Em relação ao espaço na memória, os arrays distribuem seus valores lado a lado sequencialmente. A variável de array consiste no array inteiro com seus elementos. Ele não é apenas um ponteiro para o primeiro elemento, como em C. Isso significa que, ao atribuir ou passar um array, será criada uma cópia completa do seu conteúdo.

---

**Slices**

Os slices em Go são estruturas de dados semelhantes aos arrays, mas com comportamento diferente: não possuem tamanho fixo e contam com uma estrutura mais flexível.

Um slice é composto por três elementos:

- Um ponteiro para um array subjacente
- Um inteiro que determina seu comprimento (*len*)
- Um inteiro que determina sua capacidade (*cap*)

O comprimento é o número de elementos referenciados pelo slice, enquanto a capacidade é o número de elementos do array subjacente.

Podemos criar slices utilizando a função padrão `make`:

```go
func make([]T, len, cap) []T

s := make([]byte, 5, 5)
```

O parâmetro `cap` é opcional. Quando não informado, a capacidade será igual ao comprimento:

```go
s := make([]int, 5)

len(s) == 5
cap(s) == 5
```

Ao executar essa função, é criado na memória um array com o tamanho definido pela capacidade e com a quantidade de elementos inicializados igual ao comprimento.

```go
s := make([]int, 3, 6) // → [0] [0] [0] [] [] []
```

Se tentarmos acessar `s[3]`, teremos o erro:  
`panic: runtime error: index out of range [3] with length 3`

Para utilizar as demais posições da capacidade, usamos o `append`:

```go
s = append(s, 2)
```

Nesse caso, o comprimento passa para 4 e o slice continua apontando para o mesmo array subjacente.

Se adicionarmos mais elementos até ultrapassar a capacidade:

```go
s = append(s, 3, 4, 5)
```

Como o array tem tamanho fixo, ao tentar inserir o sexto elemento o Go cria internamente um novo array com o dobro da capacidade, copia os elementos do array antigo e adiciona o novo valor. O ponteiro do slice passa a apontar para esse novo array.

A memória do array antigo será liberada pelo *garbage collector*, caso esteja na *heap*.

Esse comportamento pode ser observado no exemplo abaixo:

```go
func main() {
	s := make([]int, 3, 6)
	fmt.Printf("%p\n", &s[0]) // output: 0xc000100000

	s = append(s, 2)
	fmt.Printf("%p\n", &s[0]) // output: 0xc000100000

	s = append(s, 3, 4, 5)
	fmt.Println(cap(s))       // output: 12
	fmt.Printf("%p\n", &s[0]) // output: 0xc000180000
}
```

- O slice é criado com um array subjacente de seis posições, com endereço inicial `0xc000100000`.
- Após adicionar um elemento, o endereço permanece o mesmo.
- Ao adicionar mais três elementos, a capacidade passa de 6 para 12 e o endereço muda para `0xc000180000`, indicando a criação de um novo array adjacente.

A capacidade define até onde um slice pode crescer antes que o runtime precise alocar um novo array e copiar os dados existentes. Esse processo de realocação pode impactar diretamente a performance de aplicações que manipulam grandes volumes de dados ou realizam muitas operações de inserção. Planejar corretamente o tamanho inicial e a capacidade dos slices ajuda a reduzir cópias desnecessárias, otimizar o uso da memória e garantir maior desempenho em cenários críticos.

---

**Referência**:

GERRAND, Andrew. **Go Slices: usage and internals**. 2011. Disponível em: https://go.dev/blog/slices-intro. Acesso em: 09 dez. 2025.

HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.