import { PhoneIcon, ViewIcon, AttachmentIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Icon,
  Image,
} from "@chakra-ui/react";
import Gifmodal from "../Gif/gifmodal";
import {AiOutlineGif} from 'react-icons/ai'
import { SearchContextManager } from "@giphy/react-components";

const ProfileModal = ({ user, children, seconduser, onImageUpload, onGifClick, onVideoCall}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  //useDisclosure for gifmodal
  const { isOpen: isOpenGif, onOpen: onOpenGif, onClose: onCloseGif } = useDisclosure();

  const handleImageUpload = () => {
    onImageUpload.open();
    onClose();
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <>
          <div style={{display:'flex',columnGap: '10px',justifyContent:'space-between'}}>
            <IconButton onClick={onOpen} icon={<ViewIcon />} />
            <IconButton onClick={onVideoCall} icon={<PhoneIcon />} />
            <IconButton icon={<AttachmentIcon />} onClick={handleImageUpload}/>
            <Icon as={AiOutlineGif} onClick={onOpenGif} style={{cursor:"pointer"}}/>
          </div>
        </>
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.profileimage}
              alt={user.name}
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email: {user.email}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal size="lg" onClose={onCloseGif} isOpen={isOpenGif} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Gif Search
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <SearchContextManager apiKey={"0WiyjLFOd9zSJXhyom6qzPa6Ma3gJMSk"}>
              <Gifmodal onGifClick={onGifClick}/>
            </SearchContextManager>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
