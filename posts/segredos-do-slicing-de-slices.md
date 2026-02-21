Slicing é a operação de criar uma nova slice a partir de outra slice já existente, especificando um intervalo de índices. A sintaxe básica é `slice[low:high]`, onde **low** é o índice inicial (inclusivo) e **high** é o índice final (exclusivo); se omitidos, assumem valores padrão (início ou fim da coleção).

Entretanto, quando um slice é criado a partir de outro slice, ambos compartilham do mesmo array subjacente, mas com comprimento e capacidade diferentes entre si.

> Lembrando que o comprimento é o número de elementos referenciados pelo slice, enquanto a capacidade é o número de elementos do array subjacente.

```go
s1 := make([]int, 3, 6)
s2 := s1[1:3]
```

#### O perigo do compartilhamento

Ambos os slices estão ligados ao mesmo array subjacente e, por conta disso, se há alguma alteração dos elementos compartilhados entre ambos, essa alteração tem reflexo nos dois slices.

```go
func main() {
	s1 := make([]int, 3, 6)
	s2 := s1[1:3]

	fmt.Println(s1) // output: [0 0 0]
	fmt.Println(s2) // output: [0 0]

	s2[0] = 1

	fmt.Println(s1) // output: [0 1 0]
	fmt.Println(s2) // output: [1 0]

	s1[2] = 2

	fmt.Println(s1) // output: [0 1 2]
	fmt.Println(s2) // output: [1 2]
}
```

#### Append em slices compartilhados

Agora, o que acontece se adicionarmos mais um elemento em `s2`?

Nesse caso, o array subjacente é modificado com a adição do novo elemento, porém somente o tamanho de `s2` se altera. Isso significa que, mesmo `s1` e `s2` compartilharem o mesmo array, o novo elemento pode ser acessado somente por `s2`.

```go
func main() {
	s1 := make([]int, 3, 6)
	s2 := s1[1:3]

	fmt.Println(len(s1)) // output: 3
	fmt.Println(cap(s1)) // output: 6

	s2 = append(s2, 4)

	fmt.Println(len(s1)) // output: 3
	fmt.Println(cap(s1)) // output: 6

	fmt.Println(s1) // output: [0 0 0]
	fmt.Println(s2) // output: [0 0 4]
}
```

#### Quando a capacidade é ultrapassada

Por fim, o que acontece se continuarmos adicionando elementos em `s2` até passar da capacidade do array subjacente?

Quando a quantidade de elementos ultrapassa a capacidade, é criado um novo array subjacente, com o dobro da capacidade. Os elementos de `s2` são copiados para ele e `s2` passa a referenciá-lo. Com isso, `s1` e `s2` deixam de compartilhar o mesmo array. Alterações em `s2` não terão mais efeito em `s1` e vice-versa.

```go
func main() {
	s1 := make([]int, 3, 6)
	s2 := s1[1:3]

	fmt.Println(len(s1)) // output: 3
	fmt.Println(cap(s1)) // output: 6

	fmt.Println(len(s2)) // output: 2
	fmt.Println(cap(s2)) // output: 5

	s2 = append(s2, 4, 5, 6, 7)

	fmt.Println(len(s1)) // output: 3
	fmt.Println(cap(s1)) // output: 6

	fmt.Println(len(s2)) // output: 6
	fmt.Println(cap(s2)) // output: 10

	s2[0] = 1

	fmt.Println(s1) // output: [0 0 0]
	fmt.Println(s2) // output: [1 0 4 5 6 7]
}
```

O slicing em Go permite criar novas fatias a partir de arrays ou slices já existentes. É importante lembrar que slices podem compartilhar o mesmo array subjacente, o que faz com que alterações em um afetem o outro. Quando a capacidade é ultrapassada, um novo array é criado e o slice passa a referenciá-lo sozinho. Entender esse comportamento ajuda a usar slices de forma correta e sem surpresas.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.